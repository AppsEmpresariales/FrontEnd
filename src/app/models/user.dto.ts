export type AppRole =
  | 'admin'
  | 'admin_org'
  | 'user'
  | 'editor'
  | 'revisor'
  | 'aprobador'
  | 'sistema';

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  roles?: AppRole[];
  organizacionNit?: number;
  organizacionNombre?: string;
}
