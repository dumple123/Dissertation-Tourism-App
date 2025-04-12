import express from "express";
import prisma from "../prisma/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.post("/", async (req, res) => {
  const { email, username, password } = req.body;

  // Basic input validation
  if (!email || !username || !password) {
    return res
      .status(400)
      .json({ success: false, error: "All fields are required" });
  }

  try {
    // Check if the email is already in use
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: "Email already in use" });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });

    // Generate access token
    const accessToken = jwt.sign(
      { id: newUser.id, use: "access" },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRY }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { id: newUser.id, use: "refresh" },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRY }
    );

    // Return user info along with tokens
    return res.status(200).json({
      success: true,
      userId: newUser.id,
      username: newUser.username,
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;