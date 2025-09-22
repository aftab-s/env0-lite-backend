import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { createUser, getAllUsers, getUserById, updateUser, findByEmail, softDeleteUser, hardDeleteUser } from '../../repositories/user.repository';
import { generateToken } from '../../middleware/tokenManagement';
import { UserInput, UserRole } from '../../types/user.types';

function generateUsername(name: string) {
  const base = name.split(' ')[0].toLowerCase();
  const rand = Math.random().toString(36).substring(2, 8);
  return `${base}_${rand}`;
}

const ManualAuthController = {
    
  async signup(req: Request, res: Response) {
    const { name, email, password, role } = req.body as UserInput;
    if (!name || !email || !password || !role) return res.status(400).json({ error: 'Missing fields' });

    const existing = await findByEmail(email);
    if (existing) return res.status(409).json({ error: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const username = generateUsername(name);

    const user = await createUser({ userId, username, name, email, password: hashed, role });
    res.status(201).json({ userId: user.userId, username: user.username, name: user.name, email: user.email, role: user.role, status: user.status });
  },

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const user = await findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    // Include userId, username, name in token
    const token = generateToken({ userId: user.userId, username: user.username, name: user.name, role: user.role });
    res.json({ token });
  },

  async getAllUsers(req: Request, res: Response) {
    const users = await getAllUsers();
    res.json(users.map(u => ({
      userId: u.userId,
      username: u.username,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    })));
  },

  async getUserById(req: Request, res: Response) {
    const { id } = req.params;
    const user = await getUserById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      userId: user.userId,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  },

  async getUserByEmail(req: Request, res: Response) {
    const { email } = req.body;
    const user = await findByEmail(email);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      userId: user.userId,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  },



  async updateUser(req: Request, res: Response) {
    const { id } = req.params;
    const data = req.body;
    if (data.password) delete data.password; // Don't allow password update here
    const user = await updateUser(id, data);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      userId: user.userId,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  },

  // Soft delete: set status to INACTIVE
  async softDeleteUser(req: Request, res: Response) {
    const { id } = req.params;
    const user = await softDeleteUser(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User soft deleted', userId: user.userId, status: user.status });
  },

  // Hard delete: remove from DB
  async hardDeleteUser(req: Request, res: Response) {
    const { id } = req.params;
    const user = await hardDeleteUser(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User hard deleted', userId: user.userId });
  },
};

export default ManualAuthController;