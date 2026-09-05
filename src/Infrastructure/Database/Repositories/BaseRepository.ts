import {
  DeepPartial,
  EntityTarget,
  FindOptionsOrder,
  FindOptionsWhere,
  ObjectLiteral,
  QueryDeepPartialEntity,
  Repository,
} from "typeorm";
import { getDataSource } from "@database/DBConnection";

export interface QueryOptions<TModel> {
  order?: FindOptionsOrder<TModel>;
  take?: number;
  skip?: number;
}

export abstract class BaseRepository<TModel extends ObjectLiteral> {
  protected constructor(private readonly model: EntityTarget<TModel>) {}

  /**
   * Resolves the TypeORM repository, initializing the DataSource on first use.
   *
   * This replaced a synchronous getter that called
   * `AppDataSource.getRepository(...)` directly and threw if the DataSource had
   * not been initialized yet — which is reachable on a serverless cold start
   * where a request can run before the instrumentation hook has completed.
   * The public method signatures below are unchanged; they were already async.
   */
  protected async getRepository(): Promise<Repository<TModel>> {
    const dataSource = await getDataSource();
    return dataSource.getRepository(this.model);
  }

  async create(entity: DeepPartial<TModel>): Promise<TModel> {
    return (await this.getRepository()).save(entity);
  }

  async fetch(searchFilters: FindOptionsWhere<TModel>): Promise<TModel | null> {
    return (await this.getRepository()).findOne({ where: searchFilters });
  }

  async fetchAll(
    searchFilters: FindOptionsWhere<TModel>,
    options: QueryOptions<TModel> = {}
  ): Promise<TModel[]> {
    return (await this.getRepository()).find({ where: searchFilters, ...options });
  }

  async edit(
    searchFilters: FindOptionsWhere<TModel>,
    entity: QueryDeepPartialEntity<TModel>
  ): Promise<void> {
    await (await this.getRepository()).update(searchFilters, entity);
  }

  async remove(searchFilters: FindOptionsWhere<TModel>): Promise<void> {
    await (await this.getRepository()).delete(searchFilters);
  }
}
