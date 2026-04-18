import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DB_CONNECTION,
  entities: [`${__dirname}/**/*.entity{.ts,.js}`],
  synchronize: true,
  namingStrategy: new SnakeNamingStrategy(),
});

export default AppDataSource;
