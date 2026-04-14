import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const typeormConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const dbConnection = configService.get<string>('db.dbConnection');

  return {
    type: 'postgres',
    // direct ipv4
    // url: `postgresql://postgres:${dbPassword}@db.hiujcyrumhspejlquvls.supabase.co:5432/postgres`,
    // transaction pool
    // url: `postgresql://postgres.hiujcyrumhspejlquvls:${dbPassword}@aws-1-us-east-2.pooler.supabase.com:6543/postgres`,
    // shared pool
    url: dbConnection,
    // host: 'localhost',
    // port: 3306,
    // username: 'root',
    // password: 'akupadamu123',
    // database: 'saricommerce',
    entities: ['dist/**/entities/*.entity{.ts,.js}'],
    synchronize: true,
    namingStrategy: new SnakeNamingStrategy(),
  };
};
