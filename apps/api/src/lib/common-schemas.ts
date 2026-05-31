import { z } from "@hono/zod-openapi";

/**
 * ID path parameter schema
 */
export const IdParamsSchema = z.object({
  id: z.string().openapi({
    example: "icuqfr6x1asagxffzsl1pkev",
    description: "ID of the resource",
  }),
});

/**
 * Not found error response schema
 */
export const NotFoundSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: "Not found" }),
});

/**
 * Helper to create HTTP error response schemas
 */
export function createHttpErrorSchema(params: {
  statusCode: "401" | "404" | "409";
  example?: string;
}) {
  const defaultStatusTexts = {
    "401": "Unauthorized",
    "404": "Not found",
    "409": "Conflict",
  } as const;

  const example = params.example ?? defaultStatusTexts[params.statusCode];

  return z.object({
    success: z.boolean().openapi({ example: false }),
    message: z.string().openapi({ example }),
  });
}

/**
 * Common pagination query parameters
 * Optional: If not provided, no pagination is applied
 * Max perPage: 100
 */
export const PaginationQuerySchema = z.object({
  perPage: z.coerce.number().int().min(1).max(100).optional().openapi({
    example: 50,
    description:
      "Number of items per page (1-100). If not provided, all items are returned.",
  }),
  page: z.coerce.number().int().min(1).default(1).openapi({
    example: 1,
    description: "Page number (1-indexed). Defaults to 1.",
  }),
});

/**
 * Sort order enum
 */
export const SortOrderSchema = z
  .enum(["asc", "desc"])
  .default("desc")
  .openapi({
    param: { name: "order", in: "query" },
    example: "desc",
    description: "Sort order (ascending or descending)",
  });

/**
 * Helper to create a sortBy schema for a specific set of fields
 */
export function createSortBySchema<T extends readonly [string, ...string[]]>(
  fields: T,
  defaultField: T[number]
) {
  return z
    .enum(fields)
    .default(defaultField)
    .openapi({
      param: { name: "sortBy", in: "query" },
      example: defaultField,
      description: `Field to sort by (${fields.join(", ")})`,
    });
}

/**
 * Helper to build Prisma orderBy from sortBy and order params
 */
export function buildOrderBy(sortBy: string, order: "asc" | "desc") {
  return { [sortBy]: order };
}

/**
 * Helper to build Prisma pagination from page and perPage params
 * Returns empty object if perPage is not provided
 */
export function buildPagination(
  page?: number | undefined,
  perPage?: number | undefined
) {
  // Only apply pagination if perPage is provided
  if (perPage === undefined) {
    return {};
  }

  const pagination: { skip?: number; take?: number } = {};

  // Calculate skip based on page number (default to page 1)
  const currentPage = page ?? 1;
  pagination.skip = (currentPage - 1) * perPage;
  pagination.take = perPage;

  return pagination;
}
