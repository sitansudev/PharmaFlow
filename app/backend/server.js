import "dotenv/config";
import app from "./app.js";
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 PharmaFlow API running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map