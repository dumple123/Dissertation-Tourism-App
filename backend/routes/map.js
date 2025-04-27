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
        buildings: true,
      },
    });

    res.json(maps);
  } catch (err) {
    console.error("Error fetching maps:", err);
    res.status(500).json({ error: "Failed to fetch maps" });
  }
});

// ➡️ NEW: Get all maps that a user has completed at least 50%
router.get("/completed/:userId", verifyToken, async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch all maps and their POIs
    const maps = await prisma.map.findMany({
      include: {
        pois: {
          select: {
            id: true,
            geojson: true,
          },
        },
      },
    });

    // Fetch user POI visits
    const userProgress = await prisma.user_POI_Progress.findMany({
      where: { userId },
      select: { poiId: true },
    });

    const visitedPOIIds = new Set(userProgress.map(progress => progress.poiId));

    const completedMaps = maps
      .map(map => {
        const totalPOIs = map.pois.length;
        const visitedPOIs = map.pois.filter(poi => visitedPOIIds.has(poi.id)).length;
        const completionRate = totalPOIs === 0 ? 0 : visitedPOIs / totalPOIs;

        return {
          id: map.id,
          name: map.name,
          completionRate,
          pois: map.pois,
        };
      })
      .filter(map => map.completionRate >= 0.5); // Keep only maps completed 50%+

    res.json(completedMaps);
  } catch (err) {
    console.error("Error fetching completed maps:", err);
    res.status(500).json({ error: "Failed to fetch completed maps" });
  }
});

export default router;
