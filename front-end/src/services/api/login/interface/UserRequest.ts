export interface UserRequest {
  name: string;
  email: string;
  password: string;
  registrationNumber: string;
  birthDate: string;
  course?: string;
  period?: string;
}
