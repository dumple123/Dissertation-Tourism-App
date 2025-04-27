import http from "http";
import express from "express";
import cors from "cors";
import verifyToken from "./middleware/verifyToken.js";

const app = express();
const server = http.createServer(app);

// Middleware to parse JSON
app.use(express.json());
app.use(cors({ origin: "*" }));

// Import and use routers
import loginRouter from "./routes/login.js";        // login route
import signupRouter from "./routes/signup.js";      // signup route
import refreshToken from "./utils/refreshToken.js"; // refresh JWT token

// Mapping routes
import mapRouter from "./routes/map.js";             // indoor maps route
import buildingRouter from "./routes/building.js";   // buildings route
import roomRouter from "./routes/room.js";           // rooms route 
import markerRouter from "./routes/interiorMarker.js"; // Interior Marker Routes
import poiRoutes from './routes/pois.js';
import poiProgressRoutes from './routes/poiProgress.js';

// Public Routes (No Authentication required)
app.use("/login", loginRouter);
app.use("/signup", signupRouter);
app.use("/refreshToken", refreshToken);

// Protected routes (authentication required)
app.use("/protected-route", verifyToken, (req, res) => {
  res.status(200).json({
    message: "This is a protected route",
    user: req.user, // The authenticated user is attached to req.user
  });
});


// mapping routes (authentication required)
app.use("/api/maps", verifyToken, mapRouter);
app.use("/api/buildings", verifyToken, buildingRouter);
app.use("/api/rooms", verifyToken, roomRouter);
app.use("/api/markers", verifyToken, markerRouter);
app.use('/api/pois', verifyToken, poiRoutes);
app.use('/api/poi-progress', verifyToken, poiProgressRoutes);

// Start server
server.listen(3000, '0.0.0.0', function () {
  console.log("Server listening on port " + server.address().port);
});
