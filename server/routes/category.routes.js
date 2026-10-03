const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'forgeai-admin-secret-change-me';

// Inline middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Bearer token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }
      
      // Verify payload indicates admin privileges
      if (decoded && decoded.role === 'admin') {
        req.adminUser = decoded;
        next();
      } else {
        return res.status(403).json({ error: 'Admin access privileges required' });
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Authentication internal failure', details: error.message });
  }
};

// GET /api/categories - PUBLIC
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({});
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve categories', details: error.message });
  }
});

// GET /api/categories/:id - PUBLIC
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    return res.status(200).json(category);
  } catch (error) {
    return res.status(500).json({ error: 'Error finding category', details: error.message });
  }
});

// POST /api/categories - PUBLIC (Anyone can create - visitors submit forms, admin panel creates records through the same endpoint)
router.post('/', async (req, res) => {
  try {
    const { name, slug, description, icon, color } = req.body;
    
    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and Slug are required fields' });
    }

    // Check if slug is already taken to ensure uniqueness
    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({ error: 'A category with this slug already exists' });
    }

    const newCategory = new Category({
      name,
      slug,
      description: description || '',
      icon: icon || '⚡',
      color: color || '#FF0055'
    });

    const savedCategory = await newCategory.save();
    return res.status(201).json(savedCategory);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create category', details: error.message });
  }
});

// PUT /api/categories/:id - requireAdmin only
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, slug, description, icon, color } = req.body;
    
    // Check for slug uniqueness if it is being changed
    if (slug) {
      const existing = await Category.findOne({ slug, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ error: 'A category with this slug already exists' });
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name, slug, description, icon, color },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    return res.status(200).json(updatedCategory);
  } catch (error) {
    return res.status(400).json({ error: 'Failed to update category', details: error.message });
  }
});

// DELETE /api/categories/:id - requireAdmin only
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }
    return res.status(200).json({ message: 'Category successfully deleted', category: deletedCategory });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete category', details: error.message });
  }
});

module.exports = router;