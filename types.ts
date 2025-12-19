
export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member'
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  DONE = 'done'
}

export interface User {
  id: string;
  username: string; // 로그인용 아이디
  email: string;
  name: string;
  role: UserRole;
  isVerified: boolean; // 이메일 인증 여부
  password?: string;
}

export interface Project {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  client: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface Task {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  ownerId: string;
  ownerName: string;
  client: string;
  startDate: string;
  endDate: string;
  notes: string;
  status: TaskStatus;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
