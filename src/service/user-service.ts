import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export const registerUser = async (payload: any) => {
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

export const loginUser = async (payload: any) => {
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
