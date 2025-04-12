import express from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/db.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.post('/', async (req, res) => {
  const { refreshToken } = req.body;

  // Check if the refresh token is provided
  if (!refreshToken) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    // Verify the refresh token using the secret
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Ensure the token is intended for refreshing and contains a user ID
    if (decoded.use !== 'refresh' || !decoded.id) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    // Retrieve the user associated with the token
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    // If the user doesn't exist, deny access
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    // Generate a new access token
    const newAccessToken = jwt.sign(
      { id: user.id, use: 'access' },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRY }
    );

    // Respond with the new access token
    return res.json({ accessToken: newAccessToken });
  } catch (error) {
    // Handle errors, such as token verification failure
    console.error('Error refreshing token:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;