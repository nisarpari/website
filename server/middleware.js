const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ADMIN_PASSWORD } = require('./config');

// Middleware to check admin auth
const checkAdminAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Multer storage configuration for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Determine folder based on URL path
        let folder = req.body.folder || 'uploads';
        if (req.path && req.path.includes('/category-images/')) {
            folder = 'categories';
        } else if (req.path && req.path.includes('/hero-images/')) {
            folder = 'hero';
        }
        const uploadPath = path.join(__dirname, '..', 'images', folder);
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images allowed'));
        }
    }
});

module.exports = {
    checkAdminAuth,
    upload
};
