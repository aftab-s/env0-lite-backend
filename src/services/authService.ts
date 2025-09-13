import { supabaseAnon, supabaseAdmin } from "../config/supabase";

export const AuthService = {
  async signUp(email: string, password: string, fullName?: string) {
    return supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { full_name: fullName },
    });
  },

  async signIn(email: string, password: string) {
    return supabaseAnon.auth.signInWithPassword({ email, password });
  },

  async getUserFromToken(token: string) {
    return supabaseAdmin.auth.getUser(token);
  },
};
