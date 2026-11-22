import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { BadRequestError } from "../errors/app-error.js";

export function validate(schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        const parsedQuery = await schema.query.parseAsync(req.query);
        req.query = parsedQuery as typeof req.query;
      }
      if (schema.params) {
        const parsedParams = await schema.params.parseAsync(req.params);
        req.params = parsedParams as typeof req.params;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        next(new BadRequestError("Validation failed", details));
        return;
      }
      next(error);
    }
  };
}
