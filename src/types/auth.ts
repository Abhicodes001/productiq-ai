export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  company?: string;
  role?: string;
}

export interface AuthState {
  user: UserProfile | null;
  session: any | null;
  loading: boolean;
  isAuthenticated: boolean;
}
