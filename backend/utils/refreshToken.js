import jwt from "jsonwebtoken";
import prisma from "../prisma/db.js";
import dotenv from "dotenv";
dotenv.config();

// This function handles refreshing the access token using a valid refresh token
export default async function refreshToken(req, res) {
  // Extract the refresh token from the request body
  const token = req.body.refreshToken;

  // If no token was provided, return an Unauthorized (401) response
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Decode and verify the refresh token using the refresh secret
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

  // Check if the token is not meant for "refresh" or doesn't include a user ID
  if (decoded.use !== "refresh" || !decoded.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Look up the user in the database using the ID from the decoded token
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    // If the user doesn't exist, return Unauthorized
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // If user is found and everything is valid, generate a new access token
    const newAccessToken = jwt.sign(
      { id: user.id, use: "access" }, // Payload: user ID and token purpose
      process.env.JWT_ACCESS_SECRET, // Secret used to sign the access token
      {
        expiresIn: process.env.JWT_ACCESS_EXPIRY, // Expiry time from env config
      }
    );

    // Send the new access token back to the client
    return res.json({ accessToken: newAccessToken });
  } catch (error) {
    // If something goes wrong return a 500 
    res.status(500).json({ message: error.message });
  }
}
