import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from 'src/auth/auth.service';
import { JwtPayload } from 'src/auth/dto/login.dto';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authorization: string | null = request.headers['authorization'] || '';

    if (authorization && authorization.startsWith('Bearer ')) {
      try {
        const token = authorization.split(' ')[1];

        const payload: JwtPayload = this.authService.verify(token);
        (request as any).user = payload;

        return true;
      } catch (err) {
        throw new UnauthorizedException('Invalid or expired token', {
          cause: err,
        });
      }
    }

    return true;
  }
}
