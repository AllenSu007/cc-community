import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof HTTPException) {
    return c.json(
      { error: err.name, message: err.message },
      err.status
    );
  }

  console.error("Unhandled error:", err);
  return c.json(
    { error: "InternalServerError", message: "An unexpected error occurred" },
    500
  );
};
