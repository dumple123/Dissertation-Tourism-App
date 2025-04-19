import prisma from "../prisma/db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();  // Load environment variables from .env file

// Middleware function to authenticate the user
export default async function authenticate(req, res, next) {
  try {
    // Extract the token from the Authorization header (format: "Bearer <token>")
    const token = req.headers.authorization?.split(" ")[1];
    
    // Log the raw token for debugging
    console.log("Access token received:", token);
    
    // If no token is found, return a 401 Unauthorized response
    if (!token) {
      console.log("No token found in Authorization header");
      return res.status(401).json({ error: "No Token" });
    }

    // Verify the token using the secret key and decode it
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Log the decoded JWT payload
    console.log("Decoded JWT:", decoded);

    // Check if the token is valid and has the "access" type and a valid user ID
    if (decoded.use !== "access" || !decoded.id) {
      console.log("Invalid token use type or missing user ID");
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Look up the user in the database using the user ID from the decoded token
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,  // Find user by ID
      },
    });

    // If the user is not found, return a 404 Not Found response
    if (!user) {
      console.log("User not found for decoded ID:", decoded.id);
      return res.status(404).json({ error: "User not found" });
    }

    // Attach the user object to the request (req) object for further use in the route handler
    req.user = user;

    // Call the next middleware or route handler
    next();
  } catch (error) {
    // If there's any error (e.g., invalid token or database query), return a 401 Unauthorized response
    console.log("Token verification failed:", error.message);
    return res.status(401).json({ error: "Unauthorized" });
  }
}
