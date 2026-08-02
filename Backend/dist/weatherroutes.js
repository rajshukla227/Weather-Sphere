"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const weathercontroller_1 = require("./controllers/weathercontroller");
const authMiddleware_1 = require("./middleware/authMiddleware");
const router = express_1.default.Router();
// Public / optional auth search
router.post("/search", (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        return (0, authMiddleware_1.authenticateToken)(req, res, next);
    }
    next();
}, weathercontroller_1.searchWeather);
// Protected routes (require JWT token)
router.get("/history", authMiddleware_1.authenticateToken, weathercontroller_1.getSearchHistory);
router.delete("/history", authMiddleware_1.authenticateToken, weathercontroller_1.clearSearchHistory);
router.post("/saved", authMiddleware_1.authenticateToken, weathercontroller_1.saveLocation);
router.get("/saved", authMiddleware_1.authenticateToken, weathercontroller_1.getSavedLocations);
router.delete("/saved/:city", authMiddleware_1.authenticateToken, weathercontroller_1.removeSavedLocation);
exports.default = router;
