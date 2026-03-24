import "reflect-metadata";
import "dotenv/config";

import { DataSource } from "typeorm";

import { UserEntity } from "../users/entities/user.entity";

export default new DataSource({
  type: "mysql",
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "my_app_db",
  entities: [UserEntity],
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
  synchronize: false,
});
