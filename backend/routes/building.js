import express from "express";
import prisma from "../prisma/db.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Create a new building
router.post("/", verifyToken, async (req, res) => {
  const { name, mapId, numFloors, geojson } = req.body;

  try {
    const building = await prisma.building.create({
      data: {
        name,
        mapId,
        numFloors,
        geojson,
      },
    });
    res.status(201).json(building);
  } catch (err) {
    console.error("Error creating building:", err);
    res.status(500).json({ error: "Failed to create building" });
  }
});

// Get buildings for a specific map
router.get("/map/:mapId", verifyToken, async (req, res) => {
  const { mapId } = req.params;

  try {
    const buildings = await prisma.building.findMany({
      where: { mapId },
    });
    res.json(buildings);
  } catch (err) {
    console.error("Error fetching buildings:", err);
    res.status(500).json({ error: "Failed to fetch buildings" });
  }
});

export default router;
