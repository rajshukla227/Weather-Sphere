"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const JWT_SECRET = process.env.JWT_SECRET || "weathersphere_jwt_secret_key_2026";
// POST /api/auth/register
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // 1. Input Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide name, email, and password"
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }
        // 2. Check if user already exists
        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await user_1.default.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }
        // 3. Hash password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        // 4. Create user
        const user = await user_1.default.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });
        // 5. Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    }
    catch (error) {
        console.error("Error in user registration:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Registration failed"
        });
    }
};
exports.register = register;
// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }
        const normalizedEmail = email.toLowerCase().trim();
        const user = await user_1.default.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            data: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    }
    catch (error) {
        console.error("Error in user login:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Login failed"
        });
    }
};
exports.login = login;
