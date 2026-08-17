import { db } from '../database/store.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { BadRequestError, UnauthorizedError, ConflictError } from '../utils/errors.js';
import { Role, UserWithProfile } from '../models/types.js';

export async function registerUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<{ user: UserWithProfile; token: string }> {
  const existingUser = await db.findUserByEmail(data.email);
  if (existingUser) {
    throw new ConflictError('An account with this email address already exists. Please sign in.');
  }

  const passwordHash = await hashPassword(data.password);
  const newUser = await db.createUser({
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email: data.email.trim().toLowerCase(),
    passwordHash,
    role: Role.CUSTOMER,
  });

  const profile = await db.findProfileByUserId(newUser.id);
  const token = generateToken({
    userId: newUser.id,
    email: newUser.email,
    role: newUser.role,
  });

  const { passwordHash: _, ...safeUser } = newUser;

  return {
    user: {
      ...safeUser,
      profile,
    },
    token,
  };
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<{ user: UserWithProfile; token: string }> {
  const user = await db.findUserByEmail(data.email);
  if (!user) {
    throw new UnauthorizedError('Invalid email or password.');
  }

  const isPasswordValid = await comparePassword(data.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password.');
  }

  const profile = await db.findProfileByUserId(user.id);
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const { passwordHash: _, ...safeUser } = user;

  return {
    user: {
      ...safeUser,
      profile,
    },
    token,
  };
}

export async function getMe(userId: string): Promise<UserWithProfile> {
  const user = await db.findUserById(userId);
  if (!user) {
    throw new UnauthorizedError('User session not found.');
  }
  const profile = await db.findProfileByUserId(user.id);
  const { passwordHash: _, ...safeUser } = user;
  return {
    ...safeUser,
    profile,
  };
}
