/**
 * File upload middleware for Aadhaar and Land documents
 * Restricts: PDF, JPG, PNG only. Max 5MB.
 * Blue Carbon Registry - MoES / NCCR
 */
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(path.join(UPLOAD_DIR, 'aadhaar'))) {
  fs.mkdirSync(path.join(UPLOAD_DIR, 'aadhaar'), { recursive: true });
}
if (!fs.existsSync(path.join(UPLOAD_DIR, 'land'))) {
  fs.mkdirSync(path.join(UPLOAD_DIR, 'land'), { recursive: true });
}
if (!fs.existsSync(path.join(UPLOAD_DIR, 'plantation'))) {
  fs.mkdirSync(path.join(UPLOAD_DIR, 'plantation'), { recursive: true });
}

const createStorage = (subdir) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(UPLOAD_DIR, subdir));
    },
    filename: (req, file, cb) => {
      const hash = crypto.randomBytes(16).toString('hex');
      const ext = path.extname(file.originalname) || (file.mimetype === 'application/pdf' ? '.pdf' : '.jpg');
      cb(null, `${hash}${ext}`);
    },
  });

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only PDF, JPG, PNG are allowed.'), false);
  }
  cb(null, true);
};

export const uploadAadhaar = multer({
  storage: createStorage('aadhaar'),
  limits: { fileSize: MAX_SIZE },
  fileFilter,
}).single('aadhaar');

export const uploadLand = multer({
  storage: createStorage('land'),
  limits: { fileSize: MAX_SIZE },
  fileFilter,
}).single('landDocument');

const plantationImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
const plantationFileFilter = (req, file, cb) => {
  if (!plantationImageTypes.includes(file.mimetype)) {
    return cb(new Error('Only JPG and PNG images are allowed for plantation photos.'), false);
  }
  cb(null, true);
};

export const uploadPlantationImages = multer({
  storage: createStorage('plantation'),
  limits: { fileSize: MAX_SIZE },
  fileFilter: plantationFileFilter,
}).array('plantationImages', 5);
