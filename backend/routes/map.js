import express from "express";
import prisma from "../prisma/db.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Create a new map
router.post("/", verifyToken, async (req, res) => {
  const { name } = req.body;

  try {
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Map name is required' });
    }

    const newMap = await prisma.map.create({
      data: { name },
    });

    res.status(201).json(newMap);
  } catch (err) {
    console.error("Error creating map:", err);
    res.status(500).json({ error: "Failed to create map" });
  }
});

// Get all maps with their buildings
router.get("/", verifyToken, async (req, res) => {
  try {
    const maps = await prisma.map.findMany({
      include: {
        buildings: true, // optionally limit fields if needed
      },
    });

    res.json(maps);
  } catch (err) {
    console.error("Error fetching maps:", err);
    res.status(500).json({ error: "Failed to fetch maps" });
  }
});

export default router;
