const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const jwt = require('jsonwebtoken');

// Inline requireAdmin middleware
const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header is missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token missing from authorization header' });
    }

    const secret = process.env.ADMIN_JWT_SECRET || 'forgeai-admin-secret-change-me';
    const decoded = jwt.verify(token, secret);
    
    // Attach admin details if needed, then proceed
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired admin token' });
  }
};

// GET /api/questions (List all questions, with optional category filtering)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) {
      filter.category = category;
    }
    const questions = await Question.find(filter);
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve questions: ' + error.message });
  }
});

// GET /api/questions/:id (Get single question)
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve question: ' + error.message });
  }
});

// POST /api/questions (Public creation for visitors and admins)
router.post('/', async (req, res) => {
  try {
    const { category, questionText, options, correctOptionIndex, difficulty } = req.body;
    
    // Validation
    if (!category || !questionText || !options || correctOptionIndex === undefined) {
      return res.status(400).json({ error: 'Missing required fields: category, questionText, options, and correctOptionIndex are required.' });
    }

    // Convert options to Array of strings if passed as string (flexible API parsing)
    let parsedOptions = options;
    if (typeof options === 'string') {
      parsedOptions = options.split(',').map(opt => opt.trim());
    }

    if (!Array.isArray(parsedOptions) || parsedOptions.length < 2) {
      return res.status(400).json({ error: 'Options must be an array or comma-separated string containing at least 2 answers.' });
    }

    const index = parseInt(correctOptionIndex, 10);
    if (isNaN(index) || index < 0 || index >= parsedOptions.length) {
      return res.status(400).json({ error: 'correctOptionIndex must be a valid option index.' });
    }

    const newQuestion = new Question({
      category,
      questionText,
      options: parsedOptions,
      correctOptionIndex: index,
      difficulty: difficulty || 'medium'
    });

    const savedQuestion = await newQuestion.save();
    res.status(201).json(savedQuestion);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create question: ' + error.message });
  }
});

// PUT /api/questions/:id (Admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { category, questionText, options, correctOptionIndex, difficulty } = req.body;

    // Check document existence first
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Dynamic update object assembly
    const updateData = {};
    if (category !== undefined) updateData.category = category;
    if (questionText !== undefined) updateData.questionText = questionText;
    if (difficulty !== undefined) updateData.difficulty = difficulty;

    if (options !== undefined) {
      let parsedOptions = options;
      if (typeof options === 'string') {
        parsedOptions = options.split(',').map(opt => opt.trim());
      }
      if (!Array.isArray(parsedOptions) || parsedOptions.length < 2) {
        return res.status(400).json({ error: 'Options must be an array or comma-separated string containing at least 2 answers.' });
      }
      updateData.options = parsedOptions;
    }

    if (correctOptionIndex !== undefined) {
      const index = parseInt(correctOptionIndex, 10);
      const currentOptions = updateData.options || question.options;
      if (isNaN(index) || index < 0 || index >= currentOptions.length) {
        return res.status(400).json({ error: 'correctOptionIndex is out of range for the provided options.' });
      }
      updateData.correctOptionIndex = index;
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedQuestion);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update question: ' + error.message });
  }
});

// DELETE /api/questions/:id (Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
    if (!deletedQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json({ message: 'Question successfully deleted', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete question: ' + error.message });
  }
});

module.exports = router;