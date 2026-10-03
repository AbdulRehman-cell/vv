const express = require('express');
const router = express.Router();
const Score = require('../models/Score');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'forgeai-admin-secret-change-me';

// Inline admin authorization middleware
const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header is missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token is missing' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
      // Set admin info onto request
      req.admin = decoded;
      next();
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error in authentication middleware', error: error.message });
  }
};

// GET / - List scores with optional query filters (e.g. category, username, sort)
router.get('/', async (req, res) => {
  try {
    const { category, username, limit, sort } = req.query;
    const filter = {};
    
    if (category) {
      filter.category = category;
    }
    if (username) {
      filter.username = { $regex: username, $options: 'i' };
    }

    let query = Score.find(filter);

    // Apply sorting (default high score first, then quickest time taken)
    if (sort === 'date') {
      query = query.sort({ date: -1 });
    } else {
      query = query.sort({ score: -1, timeTaken: 1, date: -1 });
    }

    if (limit) {
      query = query.limit(parseInt(limit, 10));
    } else {
      query = query.limit(100); // Sensible limit for leaderboards
    }

    const scores = await query.exec();
    res.status(200).json(scores);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve scores', error: error.message });
  }
});

// GET /:id - Get a single score record
router.get('/:id', async (req, res) => {
  try {
    const scoreRecord = await Score.findById(req.params.id);
    if (!scoreRecord) {
      return res.status(404).json({ message: 'Score record not found' });
    }
    res.status(200).json(scoreRecord);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve score record', error: error.message });
  }
});

// POST / - Create a score (Public - visitors submit game results)
router.post('/', async (req, res) => {
  try {
    const { username, category, score, timeTaken, date } = req.body;

    // Validation
    if (!username || username.trim() === '') {
      return res.status(400).json({ message: 'Username is required' });
    }
    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }
    if (score === undefined || score < 0) {
      return res.status(400).json({ message: 'Valid score is required' });
    }
    if (timeTaken === undefined || timeTaken < 0) {
      return res.status(400).json({ message: 'Valid time taken is required' });
    }

    const newScore = new Score({
      username: username.trim(),
      category,
      score: Number(score),
      timeTaken: Number(timeTaken),
      date: date || new Date()
    });

    const savedScore = await newScore.save();
    res.status(201).json(savedScore);
  } catch (error) {
    res.status(400).json({ message: 'Failed to submit score', error: error.message });
  }
});

// PUT /:id - Update score (Admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { username, category, score, timeTaken, date } = req.body;
    
    const scoreRecord = await Score.findById(req.params.id);
    if (!scoreRecord) {
      return res.status(404).json({ message: 'Score record not found' });
    }

    if (username !== undefined) scoreRecord.username = username.trim();
    if (category !== undefined) scoreRecord.category = category;
    if (score !== undefined) scoreRecord.score = Number(score);
    if (timeTaken !== undefined) scoreRecord.timeTaken = Number(timeTaken);
    if (date !== undefined) scoreRecord.date = date;

    const updatedScore = await scoreRecord.save();
    res.status(200).json(updatedScore);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update score record', error: error.message });
  }
});

// DELETE /:id - Delete score (Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const scoreRecord = await Score.findByIdAndDelete(req.params.id);
    if (!scoreRecord) {
      return res.status(404).json({ message: 'Score record not found' });
    }
    res.status(200).json({ message: 'Score record deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete score record', error: error.message });
  }
});

module.exports = router;