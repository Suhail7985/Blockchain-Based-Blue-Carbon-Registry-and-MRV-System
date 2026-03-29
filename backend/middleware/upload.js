import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import config from '../config/config.js';

const UPLOAD_DIR = path.join(process.cwd(), config.uploads.path);
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_SIZE = config.uploads.maxSize;

// 1. Setup Local Storage (Fallback for Dev)
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
const localSubdirs = ['aadhaar', 'land', 'plantation'];
localSubdirs.forEach(s => {
  const p = path.join(UPLOAD_DIR, s);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

const createLocalStorage = (subdir) =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(UPLOAD_DIR, subdir)),
    filename: (req, file, cb) => {
      const hash = crypto.randomBytes(16).toString('hex');
      const ext = path.extname(file.originalname) || (file.mimetype === 'application/pdf' ? '.pdf' : '.jpg');
      cb(null, `${hash}${ext}`);
    },
  });

// 2. Setup Cloudinary Storage (For Production)
let storageAadhaar, storageLand, storagePlantation;

if (config.uploads.useCloudinary) {
  cloudinary.config({
    cloud_name: config.uploads.cloudinary.cloudName,
    api_key: config.uploads.cloudinary.apiKey,
    api_secret: config.uploads.cloudinary.apiSecret,
  });

  const generateCloudinaryStorage = (folderName) => new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `blue-carbon-registry/${folderName}`,
      allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'],
      // Cloudinary handles extension automatically
      public_id: (req, file) => crypto.randomBytes(16).toString('hex'),
      resource_type: 'auto', // Important for PDFs
    },
  });

  storageAadhaar = generateCloudinaryStorage('aadhaar');
  storageLand = generateCloudinaryStorage('land');
  storagePlantation = generateCloudinaryStorage('plantation');
} else {
  storageAadhaar = createLocalStorage('aadhaar');
  storageLand = createLocalStorage('land');
  storagePlantation = createLocalStorage('plantation');
}

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only PDF, JPG, PNG are allowed.'), false);
  }
  cb(null, true);
};

export const uploadAadhaar = multer({
  storage: storageAadhaar,
  limits: { fileSize: MAX_SIZE },
  fileFilter,
}).single('aadhaar');

export const uploadLand = multer({
  storage: storageLand,
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
  storage: storagePlantation,
  limits: { fileSize: MAX_SIZE },
  fileFilter: plantationFileFilter,
}).array('plantationImages', 5);
