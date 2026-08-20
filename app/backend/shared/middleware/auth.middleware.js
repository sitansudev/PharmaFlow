import { verifyToken } from "../utils/jwt.js";
export function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Authentication token missing",
        });
    }
    const token = authHeader.split(" ")[1];
    try {
        req.user = verifyToken(token);
        next();
    }
    catch {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
}
//# sourceMappingURL=auth.middleware.js.map