import { Exclude, Expose } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class SignupDto {
  @IsString()
  username: string;
  @IsString()
  @IsOptional()
  firstname: string;
  @IsOptional()
  @IsString()
  lastname: string;
  @IsEmail()
  email: string;
  @IsString()
  phone: string;
  @IsStrongPassword({
    minUppercase: 0,
    minLength: 5,
    minNumbers: 1,
    minSymbols: 0,
  })
  password: string;
}

export class SignupResponseDto {
  @Expose()
  id: number;
  @Expose()
  username: string;
  @Expose()
  firstname: string;
  @Expose()
  lastname: string;
  @Expose()
  email: string;
  @Expose()
  phone: string;
  @Exclude()
  password: string;
}
