import express from 'express';
import prisma from '../prisma/db.js';

const router = express.Router();

// GET all POIs visited by a user
router.get('/user/:userId', async (req, res) => {
  try {
    const progress = await prisma.user_POI_Progress.findMany({
      where: { userId: req.params.userId },
      include: { poi: true }, // optional: include full POI info
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

// DELETE to unmark a visit (optional feature)
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
