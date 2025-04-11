import express from "express";
import prisma from "../prisma/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/", async (req, res) => {
  const { email, username, password } = req.body;

  // Basic input validation
  if (!email || !username || !password) {
    return res.status(400).json({ success: false, error: "All fields are required" });
  }

  try {
    // Check if the email is already in use
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "Email already in use" });
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

    const token = jwt.sign(
      { userId: user.id, username: user.username }, // data you want inside token
      process.env.JWT_SECRET, // secret key
      { expiresIn: process.env.JWT_ACCESS_EXPIRY } // optional expiry
    );

    return res.status(200).json({
      success: true,
      token,
      userId: user.id,
      username: user.username,
    });

  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({success: false});
  }
});

export default router;
