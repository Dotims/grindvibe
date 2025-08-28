export type AuthUser = {
  id: number;             // zgodnie z backendowym int Id
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
};

export type LoginInput = { email: string; password: string };
export type RegisterInput = { email: string; password: string; firstName?: string; lastName?: string };

export type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
};
