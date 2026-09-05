export interface IReadRepository {
  fetch(searchFilters: any): Promise<any>;
  fetchAll(searchFilters: any, options?: any): Promise<any>;
}

export interface ICreateRepository {
  create(entity: any): Promise<any>;
}

export interface IModifyRepository {
  edit(searchFilters: any, entity: any): Promise<void>;
  remove(searchFilters: any): Promise<void>;
}

export interface IBaseRepository
  extends IReadRepository,
    ICreateRepository,
    IModifyRepository {}
