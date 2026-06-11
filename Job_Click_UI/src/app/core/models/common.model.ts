/** Numeric identifier (matches `bigint` PKs in the ERD). */
export type Id = number;

/** Standard single-resource envelope returned by the API. */
export interface ApiResponse<T> {
  data: T;
}

/** Standard paginated list envelope. */
export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/** Normalized error shape surfaced to the UI by the error interceptor. */
export interface ApiError {
  status: number;
  code: string;
  message: string;
  errors?: Record<string, string[]>;
}

/** Common list query parameters (pagination, sorting, search). */
export interface PageQuery {
  page?: number;
  pageSize?: number;
  /** e.g. `createdAt,-title` (prefix `-` for descending). */
  sort?: string;
  q?: string;
}
