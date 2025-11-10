const Plantation = require('../models/Plantation');
const { CARBON_SEQUESTRATION_RATE } = require('../utils/constants');

// @desc    Get all plantations
// @route   GET /api/plantations
// @access  Public
const getAllPlantations = async (req, res) => {
  try {
    const plantations = await Plantation.find().sort({ createdAt: -1 });
    res.json(plantations);
  } catch (error) {
    console.error('Error fetching plantations:', error);
    res.status(500).json({ 
      message: 'Error fetching plantations', 
      error: error.message 
    });
  }
};

// @desc    Get single plantation by ID
// @route   GET /api/plantations/:id
// @access  Public
const getPlantationById = async (req, res) => {
  try {
    const plantation = await Plantation.findById(req.params.id);
    if (!plantation) {
      return res.status(404).json({ message: 'Plantation not found' });
    }
    res.json(plantation);
  } catch (error) {
    console.error('Error fetching plantation:', error);
    res.status(500).json({ 
      message: 'Error fetching plantation', 
      error: error.message 
    });
  }
};

// @desc    Create new plantation
// @route   POST /api/plantations
// @access  Public
const createPlantation = async (req, res) => {
  try {
    const {
      plantationName,
      location,
      area,
      plantedDate,
      treeCount,
      mangrovePercentage,
      contactEmail
    } = req.body;

    // Validate required fields
    if (!plantationName || !location || !area || !plantedDate || !treeCount || !mangrovePercentage || !contactEmail) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create new plantation
    const plantation = new Plantation({
      plantationName,
      location,
      area: parseFloat(area),
      plantedDate: new Date(plantedDate),
      treeCount: parseInt(treeCount),
      mangrovePercentage,
      contactEmail
    });

    // Calculate carbon sequestered
    plantation.carbonSequestered = plantation.area * CARBON_SEQUESTRATION_RATE;

    // Save to database
    const savedPlantation = await plantation.save();
    
    console.log('✅ New plantation created:', savedPlantation.plantationName);
    res.status(201).json(savedPlantation);
  } catch (error) {
    console.error('Error creating plantation:', error);
    res.status(500).json({ 
      message: 'Error creating plantation', 
      error: error.message 
    });
  }
};

// @desc    Update plantation (for verification)
// @route   PATCH /api/plantations/:id
// @access  Public (should be protected with admin auth)
const updatePlantation = async (req, res) => {
  try {
    const { status, verificationNote, verifiedAt } = req.body;
    const plantation = await Plantation.findById(req.params.id);
    
    if (!plantation) {
      return res.status(404).json({ message: 'Plantation not found' });
    }

    if (status) {
      plantation.status = status;
    }
    if (verificationNote) {
      plantation.verificationNote = verificationNote;
    }
    if (verifiedAt) {
      plantation.verifiedAt = new Date(verifiedAt);
    }

    const updatedPlantation = await plantation.save();
    console.log('✅ Plantation updated:', updatedPlantation.plantationName, 'Status:', status);
    res.json(updatedPlantation);
  } catch (error) {
    console.error('Error updating plantation:', error);
    res.status(500).json({ 
      message: 'Error updating plantation', 
      error: error.message 
    });
  }
};

// @desc    Delete plantation
// @route   DELETE /api/plantations/:id
// @access  Public (should be protected with admin auth)
const deletePlantation = async (req, res) => {
  try {
    const plantation = await Plantation.findById(req.params.id);
    
    if (!plantation) {
      return res.status(404).json({ message: 'Plantation not found' });
    }

    await plantation.deleteOne();
    console.log('✅ Plantation deleted:', plantation.plantationName);
    res.json({ message: 'Plantation deleted successfully' });
  } catch (error) {
    console.error('Error deleting plantation:', error);
    res.status(500).json({ 
      message: 'Error deleting plantation', 
      error: error.message 
    });
  }
};

module.exports = {
  getAllPlantations,
  getPlantationById,
  createPlantation,
  updatePlantation,
  deletePlantation
};

