import { isUndefined, omitBy } from "es-toolkit";

type WithoutUndefined<T> = {
  [Key in keyof T]-?: Exclude<T[Key], undefined>;
};

export const omitUndefined = <T extends object>(v: T): WithoutUndefined<T> => omitBy(v, isUndefined) as WithoutUndefined<T>;

export type Nullable<T> = T | undefined | null;

export const isNotNullable = <T>(value: Nullable<T>): value is T => value !== undefined && value !== null;

export const isNullable = <T>(value: Nullable<T>): value is null | undefined => value === undefined || value === null;
