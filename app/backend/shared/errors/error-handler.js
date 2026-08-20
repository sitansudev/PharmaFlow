import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "./app-error.js";
export function errorHandler(error, _req, res, _next) {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
    }
    if (error instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case "P2002":
                return res.status(409).json({
                    success: false,
                    message: "Duplicate value exists.",
                });
            case "P2025":
                return res.status(404).json({
                    success: false,
                    message: "Resource not found.",
                });
            default:
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
        }
    }
    console.error(error);
    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
}
//# sourceMappingURL=error-handler.js.map