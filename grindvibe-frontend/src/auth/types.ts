export type AuthUser = {
  id: number;
  email: string;
  nickname?: string | null;
  avatarUrl?: string | null;
};

export type LoginInput = { email: string; password: string };
export type RegisterInput = { email: string; password: string; nickname?: string | null };

export type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (i: LoginInput) => Promise<void>;
  register: (i: RegisterInput) => Promise<void>;
  logout: () => void;
  setUser: (u: AuthUser | null) => void;   // ← DODAJ
};
