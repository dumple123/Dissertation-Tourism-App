import express from 'express';
import prisma from '../prisma/db.js';

const router = express.Router();

// GET all POIs visited by a user
router.get('/user/:userId', async (req, res) => {
  try {
    const progress = await prisma.user_POI_Progress.findMany({
      where: { userId: req.params.userId },
      include: { 
        poi: { select: { name: true, geojson: true, mapId: true } } // Now includes POI name + geojson + mapId
      },
    });
    res.json(progress);
  } catch (err) {
    console.error('Failed to fetch POI progress:', err);
    res.status(500).json({ error: 'Failed to fetch POI progress' });
  }
});

// POST to mark a POI as visited
router.post('/', async (req, res) => {
  const { userId, poiId } = req.body;

  try {
    const progress = await prisma.user_POI_Progress.create({
      data: {
        userId,
        poiId,
      },
    });
    res.status(201).json(progress);
  } catch (err) {
    console.error('Failed to create POI progress:', err);
    res.status(500).json({ error: 'Failed to create POI progress' });
  }
});

// GET latest POIs visited globally (default 10, max 100)
router.get('/latest', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);

  try {
    const latestVisits = await prisma.user_POI_Progress.findMany({
      take: limit,
      orderBy: { visitedAt: 'desc' },
      include: {
        poi: { select: { name: true, geojson: true } }, // Includes POI name + geojson for correct pin placement
        user: { select: { username: true } },
      },
    });

    res.json(latestVisits);
  } catch (error) {
    console.error('Failed to fetch latest POI visits:', error);
    res.status(500).json({ error: 'Failed to fetch latest POI visits' });
  }
});

// GET latest POIs visited by a specific user (default 10, max 100)
router.get('/user/:userId/latest', async (req, res) => {
  const { userId } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);

  try {
    const userVisits = await prisma.user_POI_Progress.findMany({
      where: { userId },
      take: limit,
      orderBy: { visitedAt: 'desc' },
      include: {
        poi: { select: { name: true, geojson: true } }, // Includes POI name + geojson for correct pin placement
      },
    });

    res.json(userVisits);
  } catch (error) {
    console.error(`Failed to fetch POIs for user ${userId}:`, error);
    res.status(500).json({ error: 'Failed to fetch user POI visits' });
  }
});

// DELETE to unmark a visit
router.delete('/:id', async (req, res) => {
  try {
    await prisma.user_POI_Progress.delete({
      where: { id: req.params.id },
    });
    res.status(204).end();
  } catch (err) {
    console.error('Failed to delete POI progress:', err);
    res.status(500).json({ error: 'Failed to delete POI progress' });
  }
});

export default router;
