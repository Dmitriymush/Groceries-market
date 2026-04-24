export interface User {
  id: number;
  username: string;
  name: string;
  token: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface StoredAuth {
  user: User;
  token: string;
}
