require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json());

// Auth middleware
function auth(role) {
  return async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).send('No token');
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = payload;
      if (role && payload.role !== role) return res.status(403).send('Forbidden');
      next();
    } catch {
      res.status(401).send('Invalid token');
    }
  };
}

// Login endpoint
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).send('Invalid credentials');
  }
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET);
  res.json({ token });
});


const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git');

// Helper: Clone repo if not already present
async function cloneOrPullRepo(repoUrl, localPath) {
  const git = simpleGit();
  if (!fs.existsSync(localPath)) {
    await git.clone(repoUrl, localPath);
  } else {
    await git.cwd(localPath).pull();
  }
}

// Helper: Recursively list all folders in a directory (relative paths)
function listFolders(dir, base = dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    if (entry.isDirectory()) {
      const relPath = path.relative(base, path.join(dir, entry.name));
      results.push(relPath);
      results = results.concat(listFolders(path.join(dir, entry.name), base));
    }
  }
  return results;
}

// Endpoint: List all folders in a repo
app.post('/repo/folders', auth(), async (req, res) => {
  const { repoUrl } = req.body;
  if (!repoUrl) return res.status(400).json({ error: 'repoUrl required' });
  const localPath = path.join(__dirname, '../../tmp', Buffer.from(repoUrl).toString('hex'));
  try {
    await cloneOrPullRepo(repoUrl, localPath);
    const folders = ['.'].concat(listFolders(localPath));
    res.json({ folders });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Terraform plan endpoint (runs init then plan in Docker)
app.post('/terraform/plan', auth(), async (req, res) => {
  const { repoUrl, workdir } = req.body;
  if (!repoUrl) return res.status(400).json({ error: 'repoUrl required' });
  const localPath = path.join(__dirname, '../../tmp', Buffer.from(repoUrl).toString('hex'));
  try {
    await cloneOrPullRepo(repoUrl, localPath);
    const tfDir = workdir ? path.join(localPath, workdir) : localPath;
    // Run terraform init
    const dockerInit = `docker run --rm -v "${tfDir.replace(/\\/g, '/')}":/workspace -w /workspace hashicorp/terraform:1.8.3 init -input=false`;
    exec(dockerInit, { timeout: 60 * 1000 }, (initErr, initStdout, initStderr) => {
      if (initErr) {
        return res.status(500).json({ error: initStderr || initErr.message });
      }
      // Run terraform plan
      const dockerPlan = `docker run --rm -v "${tfDir.replace(/\\/g, '/')}":/workspace -w /workspace hashicorp/terraform:1.8.3 plan`;
      exec(dockerPlan, { timeout: 60 * 1000 }, (planErr, planStdout, planStderr) => {
        if (planErr) {
          return res.status(500).json({ error: planStderr || planErr.message, init: initStdout });
        }
        res.json({ output: planStdout, init: initStdout });
      });
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Run history
app.get('/runs', auth(), async (req, res) => {
  const runs = await prisma.run.findMany({ orderBy: { requestedAt: 'desc' } });
  res.json(runs);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API server running on port ${PORT}`));
