import {
  FindOptionsWhere,
  ILike,
  In,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
} from "typeorm";
import type { CleanedWhere } from "better-auth/adapters";

function buildCondition(clause: CleanedWhere): unknown {
  const { operator, value, mode } = clause;
  const insensitive = mode === "insensitive";

  switch (operator) {
    case "eq":
      return value;
    case "ne":
      return Not(value as never);
    case "lt":
      return LessThan(value as never);
    case "lte":
      return LessThanOrEqual(value as never);
    case "gt":
      return MoreThan(value as never);
    case "gte":
      return MoreThanOrEqual(value as never);
    case "in":
      return In(value as never[]);
    case "not_in":
      return Not(In(value as never[]));
    case "contains":
      return insensitive ? ILike(`%${value}%`) : Like(`%${value}%`);
    case "starts_with":
      return insensitive ? ILike(`${value}%`) : Like(`${value}%`);
    case "ends_with":
      return insensitive ? ILike(`%${value}`) : Like(`%${value}`);
    default:
      return value;
  }
}

/**
 * Flat AND-merge / OR-array only, no nested trees. Sufficient because Better
 * Auth's actual queries against the user/session/account/verification
 * models are simple single-field lookups.
 */
export function buildWhere(
  where: CleanedWhere[]
): FindOptionsWhere<any> | FindOptionsWhere<any>[] {
  const andClauses = where.filter((clause) => clause.connector !== "OR");
  const orClauses = where.filter((clause) => clause.connector === "OR");

  const andConditions: FindOptionsWhere<any> = {};
  for (const clause of andClauses) {
    andConditions[clause.field] = buildCondition(clause);
  }

  if (orClauses.length === 0) {
    return andConditions;
  }

  return orClauses.map((clause) => ({
    ...andConditions,
    [clause.field]: buildCondition(clause),
  }));
}
