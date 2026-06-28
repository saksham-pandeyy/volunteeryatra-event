import dotenv from "dotenv";

dotenv.config();

export const environment = {
  port: parseInt(process.env.PORT || "4000", 10),
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
  jwtSecret: process.env.JWT_SECRET || "default-secret-change-in-production",
};
