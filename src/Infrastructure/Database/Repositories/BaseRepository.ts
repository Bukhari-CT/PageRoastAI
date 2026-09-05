import {
  DeepPartial,
  EntityTarget,
  FindOptionsOrder,
  FindOptionsWhere,
  ObjectLiteral,
  QueryDeepPartialEntity,
  Repository,
} from "typeorm";
import { AppDataSource } from "@database/DBConnection";

export interface QueryOptions<TModel> {
  order?: FindOptionsOrder<TModel>;
  take?: number;
  skip?: number;
}

export abstract class BaseRepository<TModel extends ObjectLiteral> {
  protected constructor(private readonly model: EntityTarget<TModel>) {}

  protected get repository(): Repository<TModel> {
    return AppDataSource.getRepository(this.model);
  }

  async create(entity: DeepPartial<TModel>): Promise<TModel> {
    return this.repository.save(entity);
  }

  async fetch(searchFilters: FindOptionsWhere<TModel>): Promise<TModel | null> {
    return this.repository.findOne({ where: searchFilters });
  }

  async fetchAll(
    searchFilters: FindOptionsWhere<TModel>,
    options: QueryOptions<TModel> = {}
  ): Promise<TModel[]> {
    return this.repository.find({ where: searchFilters, ...options });
  }

  async edit(
    searchFilters: FindOptionsWhere<TModel>,
    entity: QueryDeepPartialEntity<TModel>
  ): Promise<void> {
    await this.repository.update(searchFilters, entity);
  }

  async remove(searchFilters: FindOptionsWhere<TModel>): Promise<void> {
    await this.repository.delete(searchFilters);
  }
}
