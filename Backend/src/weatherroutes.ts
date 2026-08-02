import express from "express";
import {
  searchWeather,
  getSearchHistory,
  clearSearchHistory,
  saveLocation,
  getSavedLocations,
  removeSavedLocation
} from "./controllers/weathercontroller";
import { authenticateToken } from "./middleware/authMiddleware";

const router = express.Router();

// Public / optional auth search
router.post("/search", (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    return authenticateToken(req, res, next);
  }
  next();
}, searchWeather);

// Protected routes (require JWT token)
router.get("/history", authenticateToken, getSearchHistory);
router.delete("/history", authenticateToken, clearSearchHistory);

router.post("/saved", authenticateToken, saveLocation);
router.get("/saved", authenticateToken, getSavedLocations);
router.delete("/saved/:city", authenticateToken, removeSavedLocation);

export default router;