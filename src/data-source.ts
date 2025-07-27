import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Status } from './entity/Status';
import { Blog } from './entity/Blog';

export const AppDataSource =
  process.env.NODE_ENV === 'test'
    ? new DataSource({
        type: 'sqlite',
        database: ':memory:',
        entities: [Status, Blog],
        synchronize: true,
        logging: false,
      })
    : new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'dbpostgre',
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASS || 'postgres',
        database: process.env.DB_NAME || 'postgres',
        entities: [Status, Blog],
        synchronize: true, // Use apenas em desenvolvimento
        logging: false,
      });
