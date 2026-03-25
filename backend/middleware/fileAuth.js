import Plantation from '../models/Plantation.js';
import User from '../models/User.js';

/**
 * Middleware to protect sensitive file access (Aadhaar, Land docs, etc.)
 * Only the owner of the document or an authorized Admin/Verifier can view.
 */
export const authorizeFileAccess = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Admins and Verifiers have global read access to audit evidence
    if (['admin', 'verifier', 'panchayat'].includes(user.role)) {
      return next();
    }

    // Citizens/NGOs can only view their own documents
    // We check if this filename is associated with the user in the User or Plantation models
    const isUserDoc = await User.findOne({ 
      _id: user.id, 
      $or: [
        { aadhaarDocumentPath: filename },
        { landDocumentPath: filename }
      ]
    });

    if (isUserDoc) return next();

    const isPlantationDoc = await Plantation.findOne({
      userId: user.id,
      imagePaths: filename
    });

    if (isPlantationDoc) return next();

    // If no match found, deny access
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. You are not authorized to view this document.' 
    });

  } catch (error) {
    console.error('File Auth Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during file authorization' });
  }
};
