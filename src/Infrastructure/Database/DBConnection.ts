import "reflect-metadata";
import { DataSource } from "typeorm";
import { UserModel } from "./Models/UserModel";
import { SessionModel } from "./Models/SessionModel";
import { AccountModel } from "./Models/AccountModel";
import { VerificationModel } from "./Models/VerificationModel";

const buildDataSource = () =>
  new DataSource({
    type: "mysql",
    url: process.env.DATABASE_URL,
    synchronize: process.env.DB_SYNCHRONIZE === "true",
    logging: process.env.DB_LOGGING === "true",
    entities: [UserModel, SessionModel, AccountModel, VerificationModel],
  });

declare global {
  var __dataSource: DataSource | undefined;
}

export const AppDataSource = globalThis.__dataSource ?? buildDataSource();

if (process.env.NODE_ENV !== "production") {
  globalThis.__dataSource = AppDataSource;
}
