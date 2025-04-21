import express from "express";
import prisma from "../prisma/db.js";

const router = express.Router();

// Create a new building
router.post("/", async (req, res) => {
  const { name, mapId, numFloors, bottomFloor, geojson } = req.body;

  try {
    const building = await prisma.building.create({
      data: {
        name,
        mapId,
        numFloors,
        bottomFloor,
        geojson,
      },
    });
    res.status(201).json(building);
  } catch (err) {
    console.error("Error creating building:", err);
    res.status(500).json({ error: "Failed to create building" });
  }
});

// Get all buildings for a specific map
router.get("/map/:mapId", async (req, res) => {
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

// Get a building by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const building = await prisma.building.findUnique({
      where: { id },
    });

    if (!building) {
      return res.status(404).json({ error: "Building not found" });
    }

    res.json(building);
  } catch (err) {
    console.error("Error fetching building:", err);
    res.status(500).json({ error: "Failed to fetch building" });
  }
});

// Update a building by ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, mapId, numFloors, bottomFloor, geojson } = req.body;

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (mapId !== undefined) updateData.mapId = mapId;
  if (numFloors !== undefined) updateData.numFloors = numFloors;
  if (bottomFloor !== undefined) updateData.bottomFloor = bottomFloor;
  if (geojson !== undefined) updateData.geojson = geojson;

  try {
    const building = await prisma.building.update({
      where: { id },
      data: updateData,
    });

    res.json(building);
  } catch (err) {
    console.error("Error updating building:", err);

    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Building not found" });
    }

    res.status(500).json({ error: "Failed to update building" });
  }
});

// Delete a building by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.building.delete({
      where: { id },
    });

    res.status(204).end(); // No content
  } catch (err) {
    console.error("Error deleting building:", err);

    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Building not found" });
    }

    res.status(500).json({ error: "Failed to delete building" });
  }
});

export default router;
