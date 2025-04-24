import express from "express";
import prisma from "../prisma/db.js";

const router = express.Router();

// Create room
router.post("/", async (req, res) => {
  const { name, floor, buildingId, geojson, accessible = false, isArea = false } = req.body;

  try {
    const room = await prisma.room.create({
      data: {
        name,
        floor,
        buildingId,
        geojson,
        accessible,
        isArea,
      },
    });
    res.status(201).json(room);
  } catch (err) {
    console.error("Error creating room:", err);
    res.status(500).json({ error: "Failed to create room" });
  }
});

// Get all rooms for a building
router.get("/building/:buildingId", async (req, res) => {
  const { buildingId } = req.params;

  try {
    const rooms = await prisma.room.findMany({ where: { buildingId } });
    res.json(rooms);
  } catch (err) {
    console.error("Error fetching rooms:", err);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

// Update room
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, floor, geojson, accessible, isArea } = req.body;

  try {
    const room = await prisma.room.update({
      where: { id },
      data: {
        name,
        floor,
        geojson,
        accessible,
        isArea,
      },
    });
    res.json(room);
  } catch (err) {
    console.error("Error updating room:", err);
    res.status(500).json({ error: "Failed to update room" });
  }
});

// Delete room
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.room.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    console.error("Error deleting room:", err);
    res.status(500).json({ error: "Failed to delete room" });
  }
});

export default router;
