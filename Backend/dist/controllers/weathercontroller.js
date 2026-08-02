"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeSavedLocation = exports.getSavedLocations = exports.saveLocation = exports.clearSearchHistory = exports.getSearchHistory = exports.searchWeather = void 0;
const weatherservice_1 = require("../weatherservice");
const WeatherSearch_1 = __importDefault(require("../models/WeatherSearch"));
const SavedLocation_1 = __importDefault(require("../models/SavedLocation"));
// POST /api/weather/search
const searchWeather = async (req, res) => {
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
            weather = await (0, weatherservice_1.getWeatherByCity)(city.trim());
        }
        else {
            weather = await (0, weatherservice_1.getWeatherByCoords)(latitude, longitude);
        }
        // Save search to database (link to user if logged in)
        try {
            await WeatherSearch_1.default.create({
                ...weather,
                userId: req.user ? req.user.id : undefined
            });
        }
        catch (dbErr) {
            console.warn("Could not save search history to MongoDB:", dbErr);
        }
        return res.status(200).json({
            success: true,
            data: weather
        });
    }
    catch (error) {
        console.error("Error in searchWeather:", error.message || error);
        return res.status(500).json({
            success: false,
            message: error.message || "Unable to fetch weather data"
        });
    }
};
exports.searchWeather = searchWeather;
// GET /api/weather/history
const getSearchHistory = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const history = await WeatherSearch_1.default.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(30);
        return res.status(200).json({
            success: true,
            data: history
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch search history"
        });
    }
};
exports.getSearchHistory = getSearchHistory;
// DELETE /api/weather/history
const clearSearchHistory = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        await WeatherSearch_1.default.deleteMany({ userId: req.user.id });
        return res.status(200).json({
            success: true,
            message: "Search history cleared"
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to clear search history"
        });
    }
};
exports.clearSearchHistory = clearSearchHistory;
// POST /api/weather/saved
const saveLocation = async (req, res) => {
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
        const existing = await SavedLocation_1.default.findOne({ userId: req.user.id, city: city.trim() });
        if (existing) {
            await SavedLocation_1.default.findByIdAndDelete(existing._id);
            return res.status(200).json({
                success: true,
                message: "Location removed from saved list",
                saved: false
            });
        }
        const saved = await SavedLocation_1.default.create({
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to save location"
        });
    }
};
exports.saveLocation = saveLocation;
// GET /api/weather/saved
const getSavedLocations = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const locations = await SavedLocation_1.default.find({ userId: req.user.id })
            .sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            data: locations
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch saved locations"
        });
    }
};
exports.getSavedLocations = getSavedLocations;
// DELETE /api/weather/saved/:city
const removeSavedLocation = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const { city } = req.params;
        await SavedLocation_1.default.findOneAndDelete({ userId: req.user.id, city });
        return res.status(200).json({
            success: true,
            message: "Location removed"
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to remove saved location"
        });
    }
};
exports.removeSavedLocation = removeSavedLocation;
