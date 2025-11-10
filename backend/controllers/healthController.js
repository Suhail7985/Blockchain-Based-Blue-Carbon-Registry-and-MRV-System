// @desc    Health check endpoint
// @route   GET /api/health
// @access  Public
const healthCheck = (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Blue Carbon Registry API is running',
    timestamp: new Date().toISOString()
  });
};

// @desc    Root endpoint
// @route   GET /
// @access  Public
const getRoot = (req, res) => {
  res.json({ 
    message: 'Blue Carbon Registry API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      getAllPlantations: 'GET /api/plantations',
      createPlantation: 'POST /api/plantations',
      getPlantation: 'GET /api/plantations/:id',
      updatePlantation: 'PATCH /api/plantations/:id',
      deletePlantation: 'DELETE /api/plantations/:id',
      login: 'POST /api/auth/login',
      register: 'POST /api/auth/register'
    }
  });
};

module.exports = {
  healthCheck,
  getRoot
};


