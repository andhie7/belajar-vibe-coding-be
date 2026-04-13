import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

export const registerUser = async (payload: RegisterPayload) => {
  const { name, email, password } = payload;

  // Check if email already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    throw new Error("email sudah terdaftar");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save user
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  return { data: "ok" };
};

export const loginUser = async (payload: LoginPayload) => {
  const { email, password } = payload;

  // Find user by email
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    throw new Error("email atau password salah");
  }

  // Compare password
  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new Error("email atau password salah");
  }

  // Generate token
  const token = crypto.randomUUID();

  // Save session
  await db.insert(sessions).values({
    token,
    userId: user.id,
  });

  return { data: token };
};

export const getCurrentUser = async (token: string) => {
  // Find session
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.token, token),
  });

  if (!session || !session.userId) {
    throw new Error("unauthorized");
  }

  // Find user
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });

  if (!user) {
    throw new Error("unauthorized");
  }

  // Return user data (omit password)
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.createdAt,
  };
};

export const logoutUser = async (token: string) => {
  // Delete session and check if anything was deleted in one query
  const deleted = await db
    .delete(sessions)
    .where(eq(sessions.token, token))
    .returning();

  if (deleted.length === 0) {
    throw new Error("unauthorized");
  }
};
