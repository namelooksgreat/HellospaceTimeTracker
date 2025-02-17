import { z } from "zod";
import { ValidationError } from "../error/ErrorHandler";

export class Validator {
  static validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(
          error.errors.map((e) => e.message).join(", "),
          { componentName: "Validator", metadata: { validationData: data } },
        );
      }
      throw error;
    }
  }

  static async validateAsync<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
  ): Promise<T> {
    try {
      return await schema.parseAsync(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(
          error.errors.map((e) => e.message).join(", "),
          { componentName: "Validator", metadata: { validationData: data } },
        );
      }
      throw error;
    }
  }

  static createSchema<T extends z.ZodRawShape>(shape: T) {
    return z.object(shape);
  }
}
