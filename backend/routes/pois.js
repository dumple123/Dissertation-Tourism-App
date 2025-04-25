import express from 'express';
import prisma from '../prisma/db.js';

const router = express.Router();

// GET all POIs for a map
router.get('/map/:mapId', async (req, res) => {
  try {
    const pois = await prisma.pOI.findMany({
      where: { mapId: req.params.mapId },
    });
    res.json(pois);
  } catch (err) {
    console.error('Failed to fetch POIs:', err);
    res.status(500).json({ error: 'Failed to fetch POIs' });
  }
});

// GET a single POI by ID
router.get('/:id', async (req, res) => {
  try {
    const poi = await prisma.pOI.findUnique({
      where: { id: req.params.id },
    });

    if (!poi) return res.status(404).json({ error: 'POI not found' });

    res.json(poi);
  } catch (err) {
    console.error('Failed to fetch POI:', err);
    res.status(500).json({ error: 'Failed to fetch POI' });
  }
});

// CREATE a new POI
router.post('/', async (req, res) => {
  const { mapId, name, description, geojson, hidden } = req.body;

  try {
    const poi = await prisma.pOI.create({
      data: {
        mapId,
        name,
        description,
        geojson,
        hidden: hidden ?? false,
      },
    });
    res.status(201).json(poi);
  } catch (err) {
    console.error('Failed to create POI:', err);
    res.status(500).json({ error: 'Failed to create POI' });
  }
});

// UPDATE a POI
router.put('/:id', async (req, res) => {
  const { name, description, geojson, hidden } = req.body;

  try {
    const updated = await prisma.pOI.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        geojson,
        hidden,
      },
    });
    res.json(updated);
  } catch (err) {
    console.error('Failed to update POI:', err);
    res.status(500).json({ error: 'Failed to update POI' });
  }
});

// DELETE a POI by ID
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.pOI.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'POI not found' });
    }

    await prisma.pOI.delete({
      where: { id: req.params.id },
    });

    res.status(204).end();
  } catch (err) {
    console.error('Failed to delete POI:', err);
    res.status(500).json({ error: 'Failed to delete POI' });
  }
});

export default router;
