import type { NextFunction, Response } from "express";
import type { IRequest } from "../types/types.js";
import { ZodType } from "zod";

interface ValidatorSchemas {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}

export const validator = (schemas: ValidatorSchemas) => {
  return (req: IRequest<any, any, any>, res: Response, next: NextFunction) => {
    const errors: any = {};

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) errors.body = result.error.message;
      else req.body = result.data;
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) errors.params = result.error.cause;
      else req.params = result.data;
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) errors.query = result.error.cause;
      else req.query = result.data;
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors,
      });
    }

    next();
  };
};
