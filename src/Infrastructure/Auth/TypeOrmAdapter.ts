import { DataSource } from "typeorm";
import { createAdapterFactory } from "better-auth/adapters";
import {
  BETTER_AUTH_MODEL_MAP,
  BetterAuthModelName,
} from "./BetterAuthModelMap";
import { buildWhere } from "./TypeOrmWhereBuilder";

function isKnownModel(model: string): model is BetterAuthModelName {
  return model in BETTER_AUTH_MODEL_MAP;
}

async function getRepository(dataSource: DataSource, model: string) {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  if (!isKnownModel(model)) {
    throw new Error(`Unknown Better Auth model: ${model}`);
  }
  return dataSource.getRepository(BETTER_AUTH_MODEL_MAP[model]);
}

export function typeOrmAdapter(dataSource: DataSource) {
  return createAdapterFactory({
    config: {
      adapterId: "typeorm",
      adapterName: "TypeORM Adapter",
      usePlural: false,
      supportsNumericIds: false,
      supportsUUIDs: false,
      supportsBooleans: true,
      supportsDates: true,
      supportsJSON: false,
      supportsArrays: false,
      transaction: false,
      disableIdGeneration: false,
    },
    adapter: () => ({
      create: async <T extends Record<string, any>>({
        model,
        data,
      }: {
        model: string;
        data: T;
        select?: string[];
      }): Promise<T> => {
        const repository = await getRepository(dataSource, model);
        return (await repository.save(data as never)) as unknown as T;
      },
      findOne: async <T>({
        model,
        where,
        select,
      }: {
        model: string;
        where: import("better-auth/adapters").CleanedWhere[];
        select?: string[];
      }): Promise<T | null> => {
        const repository = await getRepository(dataSource, model);
        return (await repository.findOne({
          where: buildWhere(where),
          ...(select ? { select: select as never } : {}),
        })) as unknown as T | null;
      },
      findMany: async <T>({
        model,
        where,
        limit,
        offset,
        sortBy,
      }: {
        model: string;
        where?: import("better-auth/adapters").CleanedWhere[];
        limit: number;
        select?: string[];
        sortBy?: { field: string; direction: "asc" | "desc" };
        offset?: number;
      }): Promise<T[]> => {
        const repository = await getRepository(dataSource, model);
        return (await repository.find({
          where: where ? buildWhere(where) : undefined,
          take: limit,
          skip: offset,
          ...(sortBy
            ? { order: { [sortBy.field]: sortBy.direction } as never }
            : {}),
        })) as unknown as T[];
      },
      update: async <T>({
        model,
        where,
        update,
      }: {
        model: string;
        where: import("better-auth/adapters").CleanedWhere[];
        update: T;
      }): Promise<T | null> => {
        const repository = await getRepository(dataSource, model);
        const criteria = buildWhere(where);
        await repository.update(criteria as never, update as never);
        return (await repository.findOne({ where: criteria })) as unknown as T | null;
      },
      updateMany: async ({ model, where, update }) => {
        const repository = await getRepository(dataSource, model);
        const result = await repository.update(
          buildWhere(where) as never,
          update as never
        );
        return result.affected ?? 0;
      },
      delete: async ({ model, where }) => {
        const repository = await getRepository(dataSource, model);
        await repository.delete(buildWhere(where) as never);
      },
      deleteMany: async ({ model, where }) => {
        const repository = await getRepository(dataSource, model);
        const result = await repository.delete(buildWhere(where) as never);
        return result.affected ?? 0;
      },
      count: async ({ model, where }) => {
        const repository = await getRepository(dataSource, model);
        return repository.count({
          where: where ? buildWhere(where) : undefined,
        });
      },
    }),
  });
}
