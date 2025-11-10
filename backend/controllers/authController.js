// @desc    Login user (Mock - Replace with real JWT auth in production)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Mock authentication - replace with real auth
    const mockUser = {
      id: '1',
      email: email,
      name: email.split('@')[0],
      role: email.includes('admin') ? 'admin' : 'ngo',
      organization: 'Sample Organization',
    };
    
    res.json({
      success: true,
      user: mockUser,
      token: 'mock-jwt-token-' + Date.now(),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ message: 'Invalid credentials' });
  }
};

// @desc    Register user (Mock - Replace with real JWT auth in production)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { email, name, role, organization, phone } = req.body;
    
    // Mock registration - replace with real auth
    const newUser = {
      id: Date.now().toString(),
      email: email,
      name: name,
      role: role || 'ngo',
      organization: organization,
      phone: phone,
    };
    
    res.json({
      success: true,
      user: newUser,
      token: 'mock-jwt-token-' + Date.now(),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ message: 'Registration failed' });
  }
};

// @desc    Get current user (Mock - Replace with real JWT auth in production)
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // Mock user - replace with real JWT verification
    const mockUser = {
      id: '1',
      email: 'user@example.com',
      name: 'User',
      role: 'ngo',
      organization: 'Sample Organization',
    };
    
    res.json({
      success: true,
      user: mockUser
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = {
  login,
  register,
  getMe
};


