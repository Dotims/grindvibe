export type AuthUser = {
  id: number;             
  email: string;
  nickname?: string;
  avatarUrl?: string;
};

export type LoginInput = { email: string; password: string };
export type RegisterInput = { email: string; password: string; nickname?: string };

export type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  setUser: (u: AuthUser | null) => void;
};
