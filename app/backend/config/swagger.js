import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
const PORT = process.env.PORT || 5001;
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "PharmaFlow API",
            version: "1.0.0",
            description: "Pharmacy Management System API",
        },
        servers: [
            {
                url: `http://localhost:${PORT}/api`,
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },
    apis: [
        "./src/modules/**/*.routes.ts",
        "./src/routes/**/*.ts",
    ],
};
export const swaggerSpec = swaggerJSDoc(options);
export { swaggerUi };
//# sourceMappingURL=swagger.js.map