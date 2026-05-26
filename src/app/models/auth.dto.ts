import { UserDto } from './user.dto';

export interface LoginDto {
  email: string;
  password?: string;
}

export interface RegisterDto {
  cedula: number;
  nombre: string;
  email: string;
  password?: string;
  organizacionNit: number;
  organizacionNombre: string;
  organizacionEmail: string;
  organizacionTelefono?: string;
  organizacionDirCalle?: string;
  organizacionDirNumero?: string;
  organizacionDirComuna?: string;
}

export interface AuthResponseDto {
  token: string;
  user: UserDto;
}
