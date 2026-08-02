import { Request, Response } from "express";
import { getWeatherByCity, getWeatherByCoords } from "../weatherservice";
import WeatherSearch from "../models/WeatherSearch";
import SavedLocation from "../models/SavedLocation";
import { AuthRequest } from "../middleware/authMiddleware";

// POST /api/weather/search
export const searchWeather = async (req: AuthRequest, res: Response) => {
  try {
    const { city, latitude, longitude } = req.body;

    if ((!city || typeof city !== "string" || !city.trim()) && (latitude === undefined || longitude === undefined)) {
      return res.status(400).json({
        success: false,
        message: "City or coordinates are required"
      });
    }

    let weather;
    if (city && typeof city === "string" && city.trim()) {
      weather = await getWeatherByCity(city.trim());
    } else {
      weather = await getWeatherByCoords(latitude, longitude);
    }

    // Save search to database (link to user if logged in)
    try {
      await WeatherSearch.create({
        ...weather,
        userId: req.user ? req.user.id : undefined
      });
    } catch (dbErr) {
      console.warn("Could not save search history to MongoDB:", dbErr);
    }

    return res.status(200).json({
      success: true,
      data: weather
    });

  } catch (error: any) {
    console.error("Error in searchWeather:", error.message || error);
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to fetch weather data"
    });
  }
};

// GET /api/weather/history
export const getSearchHistory = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const history = await WeatherSearch.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);

    return res.status(200).json({
      success: true,
      data: history
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch search history"
    });
  }
};

// DELETE /api/weather/history
export const clearSearchHistory = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    await WeatherSearch.deleteMany({ userId: req.user.id });

    return res.status(200).json({
      success: true,
      message: "Search history cleared"
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to clear search history"
    });
  }
};

// POST /api/weather/saved
export const saveLocation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { city, country, temperature, condition, latitude, longitude } = req.body;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: "City is required"
      });
    }

    // Toggle save: if already exists, remove it; if not, create it
    const existing = await SavedLocation.findOne({ userId: req.user.id, city: city.trim() });
    if (existing) {
      await SavedLocation.findByIdAndDelete(existing._id);
      return res.status(200).json({
        success: true,
        message: "Location removed from saved list",
        saved: false
      });
    }

    const saved = await SavedLocation.create({
      userId: req.user.id,
      city: city.trim(),
      country,
      temperature,
      condition,
      latitude,
      longitude
    });

    return res.status(201).json({
      success: true,
      message: "Location saved successfully",
      saved: true,
      data: saved
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to save location"
    });
  }
};

// GET /api/weather/saved
export const getSavedLocations = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const locations = await SavedLocation.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: locations
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch saved locations"
    });
  }
};

// DELETE /api/weather/saved/:city
export const removeSavedLocation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { city } = req.params;

    await SavedLocation.findOneAndDelete({ userId: req.user.id, city });

    return res.status(200).json({
      success: true,
      message: "Location removed"
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to remove saved location"
    });
  }
};