
// NOTE: Supabase Auth base endpoint (/auth/v1) will return 404. Only subpaths like /auth/v1/signup, /auth/v1/token, etc. are valid endpoints.
// See: https://supabase.com/docs/reference/auth

import { Request, Response } from "express";
import { AuthService } from "../../services/authService";

const AuthController = {
  async signUp(req: Request, res: Response) {
    const { email, password, full_name } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing fields" });

    const { data, error } = await AuthService.signUp(email, password, full_name);
    if (error) return res.status(400).json({ error: error.message });

    res.json({ user: data.user });
  },

  async signIn(req: Request, res: Response) {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing fields" });

    const { data, error } = await AuthService.signIn(email, password);
    if (error) return res.status(401).json({ error: error.message });

    res.cookie("sb:token", data.session?.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.json({ user: data.user, session: data.session });
  },

  async acceptSession(req: Request, res: Response) {
    const { access_token } = req.body;
    if (!access_token) return res.status(400).json({ error: "access_token required" });

    const { data, error } = await AuthService.getUserFromToken(access_token);
    if (error || !data?.user) return res.status(401).json({ error: error?.message });

    res.cookie("sb:token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.json({ user: data.user });
  },
};

module.exports = AuthController;
