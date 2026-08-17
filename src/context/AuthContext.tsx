import React, { createContext, useContext, useState, useEffect, useCallback, useTransition } from 'react';
import * as authService from '../services/authService';
import * as userService from '../services/userService';
import * as favoriteService from '../services/favoriteService';
import { User, Profile } from '../services/authService';
import { FavoriteItem } from '../services/favoriteService';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { firstName: string; lastName: string; email: string; password: string; confirmPassword?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  favorites: FavoriteItem[];
  refreshFavorites: () => Promise<void>;
  isFavorite: (cardIdOrSlug: string) => boolean;
  toggleFavorite: (cardIdOrSlug: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'allcardstation_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [, startTransition] = useTransition();

  const loadFavorites = useCallback(async () => {
    try {
      const res = await favoriteService.fetchFavorites();
      setFavorites(res.favorites || []);
    } catch {
      setFavorites([]);
    }
  }, []);

  const loadCurrentUser = useCallback(async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await authService.getMe();
      setUser(res.user);
      setProfile(res.user.profile || null);
      await loadFavorites();
    } catch (err) {
      console.warn('Session expired or invalid:', err);
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [loadFavorites]);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const login = async (data: { email: string; password: string }) => {
    const res = await authService.login(data);
    localStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    setUser(res.user);
    setProfile(res.user.profile || null);
    await loadFavorites();
  };

  const register = async (data: { firstName: string; lastName: string; email: string; password: string; confirmPassword?: string }) => {
    const res = await authService.register(data);
    localStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    setUser(res.user);
    setProfile(res.user.profile || null);
    await loadFavorites();
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Proceed with local cleanup regardless
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
      setProfile(null);
      setFavorites([]);
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await userService.getProfile();
      startTransition(() => {
        setUser(res.user);
        setProfile(res.profile);
      });
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const refreshFavorites = async () => {
    await loadFavorites();
  };

  const isFavorite = (cardIdOrSlug: string): boolean => {
    return favorites.some(
      (f) => f.giftCardId === cardIdOrSlug || f.giftCard?.slug === cardIdOrSlug || f.giftCard?.id === cardIdOrSlug
    );
  };

  const toggleFavorite = async (cardIdOrSlug: string): Promise<boolean> => {
    if (!token) {
      throw new Error('Please sign in to save favorites.');
    }

    const existing = favorites.find(
      (f) => f.giftCardId === cardIdOrSlug || f.giftCard?.slug === cardIdOrSlug || f.giftCard?.id === cardIdOrSlug
    );

    if (existing) {
      await favoriteService.removeFavorite(existing.id);
      setFavorites((prev) => prev.filter((f) => f.id !== existing.id));
      return false;
    } else {
      const res = await favoriteService.addFavorite(cardIdOrSlug);
      setFavorites((prev) => [...prev, res.favorite]);
      return true;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
        favorites,
        refreshFavorites,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
