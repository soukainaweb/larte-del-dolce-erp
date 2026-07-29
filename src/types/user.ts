export interface ApiRole {
  id?: number;
  name?: string;
  display_name?: string;
  description?: string;
}

export interface ApiUser {
  id: number;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  status?: string;
  role?: ApiRole | string | null;
  created_at?: string;
  createdAt?: string;
  avatar?: string;
}

export interface UserRow {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  role: ApiRole | string | null | undefined;
  createdAt: string | null;
  avatar?: string;
}

export interface UserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
}

export interface UserTableProps {
  users: UserRow[];
  isLoading: boolean;
  isRTL: boolean;
  locale: 'ar' | 'en' | 'fr';
  onView: (user: UserRow) => void;
  onEdit: (user: UserRow) => void;
  onDelete: (user: UserRow) => void;
  onAddUser: () => void;
}
