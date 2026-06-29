import bcrypt from "bcryptjs";
import { supabase } from "../../config/database";
import { DatabaseError, AuthenticationError } from "../../shared/errors";
import type { UserRow } from "../../shared/types";

export async function createUser(
  email: string,
  password: string,
  name: string
): Promise<Omit<UserRow, "password">> {
  const hashed = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from("users")
    .insert({ email, password: hashed, name })
    .select("id, email, name, created_at")
    .single();

  if (error) throw new DatabaseError(error.message);
  return data;
}

export async function findUserByEmail(
  email: string
): Promise<UserRow | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error && error.code !== "PGRST116") throw new DatabaseError(error.message);
  return data || null;
}

export async function findUserById(
  id: string
): Promise<Omit<UserRow, "password"> | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, name, avatar_url, created_at")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw new DatabaseError(error.message);
  return data || null;
}

export async function updateUserProfile(
  userId: string,
  updates: { name?: string; avatar_url?: string | null }
): Promise<Omit<UserRow, "password">> {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select("id, email, name, avatar_url, created_at")
    .single();

  if (error) throw new DatabaseError(error.message);
  return data;
}

export async function validatePassword(
  plain: string,
  hashed: string
): Promise<void> {
  const match = await bcrypt.compare(plain, hashed);
  if (!match) throw new AuthenticationError("Invalid email or password");
}

export async function updateUserPassword(
  userId: string,
  plain: string
): Promise<void> {
  const hashed = await bcrypt.hash(plain, 10);
  const { error } = await supabase
    .from("users")
    .update({ password: hashed })
    .eq("id", userId);

  if (error) throw new DatabaseError(error.message);
}

