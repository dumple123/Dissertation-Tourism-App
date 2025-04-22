import express from 'express';
import prisma from '../prisma/db.js';

const router = express.Router();

// GET all markers for a building
router.get('/building/:buildingId', async (req, res) => {
  try {
    const markers = await prisma.interiorMarker.findMany({
      where: { buildingId: req.params.buildingId },
    });
    res.json(markers);
  } catch (err) {
    console.error('Failed to fetch markers:', err);
    res.status(500).json({ error: 'Failed to fetch markers' });
  }
});

// GET a marker by ID
router.get('/:id', async (req, res) => {
  try {
    const marker = await prisma.interiorMarker.findUnique({
      where: { id: req.params.id },
    });

    if (!marker) return res.status(404).json({ error: 'Marker not found' });

    res.json(marker);
  } catch (err) {
    console.error('Failed to fetch marker:', err);
    res.status(500).json({ error: 'Failed to fetch marker' });
  }
});

// CREATE a new marker
router.post('/', async (req, res) => {
  const { buildingId, floor, type, coordinates, label, accessible, metadata } = req.body;

  try {
    const marker = await prisma.interiorMarker.create({
      data: {
        buildingId,
        floor,
        type,
        coordinates,
        label,
        accessible: accessible ?? false,
        metadata,
      },
    });
    res.status(201).json(marker);
  } catch (err) {
    console.error('Failed to create marker:', err);
    res.status(500).json({ error: 'Failed to create marker' });
  }
});

// UPDATE a marker
router.put('/:id', async (req, res) => {
  const { buildingId, floor, type, coordinates, label, accessible, metadata } = req.body;

  try {
    const updated = await prisma.interiorMarker.update({
      where: { id: req.params.id },
      data: {
        buildingId,
        floor,
        type,
        coordinates,
        label,
        accessible,
        metadata,
      },
    });
    res.json(updated);
  } catch (err) {
    console.error('Failed to update marker:', err);
    res.status(500).json({ error: 'Failed to update marker' });
  }
});

// DELETE a marker
router.delete('/:id', async (req, res) => {
  try {
    await prisma.interiorMarker.delete({
      where: { id: req.params.id },
    });
    res.status(204).end();
  } catch (err) {
    console.error('Failed to delete marker:', err);
    res.status(500).json({ error: 'Failed to delete marker' });
  }
});

export default router;
