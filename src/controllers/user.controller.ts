import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/user.model';

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, password, name, email } = req.body;

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const user = await User.create({
      userId: uuidv4(),
      username,
      password, 
      name,
      email,
    });

    res.status(201).json(user);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
