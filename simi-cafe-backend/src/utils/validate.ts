import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import xss from "xss";
import fs from "fs";

// Recursively sanitize strings in an object or array
const sanitizePayload = (obj: any): any => {
  if (typeof obj === "string") {
    return xss(obj.trim());
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizePayload);
  }
  if (obj !== null && typeof obj === "object") {
    const sanitizedObj: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      sanitizedObj[key] = sanitizePayload(obj[key]);
    }
    return sanitizedObj;
  }
  return obj;
};

// Middleware to validate req.body, req.query, and req.params using a Zod schema
export const validate = (schema: z.ZodSchema<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Sanitize incoming data
      const sanitizedBody = sanitizePayload(req.body);
      const sanitizedQuery = sanitizePayload(req.query);
      const sanitizedParams = sanitizePayload(req.params);

      // 2. Validate against Zod schema
      const parsed = await schema.parseAsync({
        body: sanitizedBody,
        query: sanitizedQuery,
        params: sanitizedParams,
      });

      // 3. Replace request objects with validated & sanitized data
      req.body = parsed.body;
      Object.keys(req.query).forEach(key => delete (req.query as any)[key]);
      Object.assign(req.query, parsed.query);
      
      Object.keys(req.params).forEach(key => delete (req.params as any)[key]);
      Object.assign(req.params, parsed.params);

      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        fs.appendFileSync("validation_errors.log", JSON.stringify({ body: req.body, errors: error.issues }) + "\n");
        console.error("Zod Validation Error:", JSON.stringify(error.issues, null, 2));
        return res.status(400).json({
          error: "Validation Error",
          details: error.issues.map((e: any) => ({ path: e.path.join("."), message: e.message })),
        });
      }
      next(error);
    }
  };
};
