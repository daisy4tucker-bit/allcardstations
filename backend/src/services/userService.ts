import { db } from '../database/store.js';
import { NotFoundError } from '../utils/errors.js';
import { Profile, UserWithProfile } from '../models/types.js';

export async function getUserProfile(userId: string): Promise<{ user: UserWithProfile; profile: Profile }> {
  const user = await db.findUserById(userId);
  if (!user) {
    throw new NotFoundError('User not found.');
  }

  let profile = await db.findProfileByUserId(userId);
  if (!profile) {
    profile = await db.updateProfile(userId, {});
  }

  const { passwordHash: _, ...safeUser } = user;

  return {
    user: {
      ...safeUser,
      profile,
    },
    profile,
  };
}

export async function updateUserProfile(
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    country?: string | null;
    avatar?: string | null;
    preferences?: string | null;
  }
): Promise<{ user: UserWithProfile; profile: Profile }> {
  const user = await db.findUserById(userId);
  if (!user) {
    throw new NotFoundError('User not found.');
  }

  if (data.firstName) user.firstName = data.firstName.trim();
  if (data.lastName) user.lastName = data.lastName.trim();
  user.updatedAt = new Date().toISOString();

  const profile = await db.updateProfile(userId, {
    phone: data.phone,
    country: data.country,
    avatar: data.avatar,
    preferences: data.preferences,
  });

  const { passwordHash: _, ...safeUser } = user;

  return {
    user: {
      ...safeUser,
      profile,
    },
    profile,
  };
}
