"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const Status_1 = require("./entity/Status");
const Blog_1 = require("./entity/Blog");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'dbpostgre',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'postgres',
    entities: [Status_1.Status, Blog_1.Blog],
    synchronize: true, // Use apenas em desenvolvimento
    logging: false,
});
