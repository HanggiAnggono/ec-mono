import { IsString } from 'class-validator';
import { SignupResponseDto } from './signup.dto';

export class LoginDto {
  @IsString()
  username: string;
  @IsString()
  password: string;
}

export class LoginResponseDto {
  token: string;
  refreshToken: string;
  user: SignupResponseDto;
}

export class JwtPayload {
  userId: number;
  username: string;
}
