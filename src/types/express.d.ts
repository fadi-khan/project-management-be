import { UserType } from 'src/enums/UserType';
 
declare global {
  namespace Express {
    interface User {
      sub: number;
      email: string;
      name?: string;
      role: UserType;
    }
  }
}
 
export {};