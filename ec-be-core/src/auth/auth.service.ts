import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { SignupDto, SignupResponseDto } from './dto/signup.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, genSalt, hash } from 'bcrypt';
import { plainToClass } from 'class-transformer';
import { typeormError } from 'src/common/error';
import { JwtPayload, LoginDto, LoginResponseDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(signupDto: SignupDto): Promise<LoginResponseDto | undefined> {
    try {
      const password = signupDto.password;
      const salt = await genSalt(10);
      const hashedPassword = await hash(password, salt);

      const user = await this.userRepository.save({
        email: signupDto.email,
        password: hashedPassword,
        firstname: signupDto.firstname,
        lastname: signupDto.lastname,
        username: signupDto.username,
        phone: signupDto.phone,
      });

      const jwts = this.generateToken(user);

      return {
        user,
        token: jwts.token,
        refreshToken: jwts.refreshToken,
      };
    } catch (err) {
      if (err instanceof QueryFailedError) {
        throw new HttpException(
          typeormError(err as QueryFailedError),
          HttpStatus.CONFLICT,
        );
      }
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userRepository.findOne({
      where: { username: loginDto.username },
    });

    if (!user) {
      throw new HttpException('Invalid Email', HttpStatus.UNAUTHORIZED);
    }

    if (!(await compare(loginDto.password, user.password))) {
      throw new HttpException('Invalid Password', HttpStatus.UNAUTHORIZED);
    }

    const tokens = this.generateToken(user);

    const loginResp = {
      token: tokens.token,
      refreshToken: tokens.refreshToken,
      user: plainToClass(SignupResponseDto, user, {
        excludeExtraneousValues: true,
      }),
    };

    return loginResp;
  }

  generateToken(user: User) {
    const secret = this.configService.get<string>('auth.jwtKey');
    const token = this.jwtService.sign(
      {
        userId: user.id,
        username: user.username,
      } as JwtPayload,
      { secret },
    );

    const refreshToken = this.jwtService.sign(
      {
        userId: user.id,
        username: user.username,
      },
      {
        expiresIn: '30d', // Refresh token valid for 7 days
        secret,
      },
    );

    return { token, refreshToken };
  }

  async refreshToken(body: RefreshTokenDto) {
    const payload: JwtPayload = this.jwtService.verify(body.refreshToken, {
      secret: this.configService.get<string>('auth.jwtKey'),
    });

    const user = await this.userRepository.findOne({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    const { token, refreshToken } = this.generateToken(user);

    return { token, refreshToken };
  }

  verify(token: string): JwtPayload {
    return this.jwtService.verify(token, {
      secret: this.configService.get<string>('auth.jwtKey'),
    });
  }
}
