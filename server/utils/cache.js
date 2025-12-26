// Cache for products (simple in-memory cache)
const productCache = {
    data: null,
    timestamp: null,
    ttl: 5 * 60 * 1000 // 5 minutes
};

const categoryCache = {
    data: null,
    timestamp: null,
    ttl: 30 * 60 * 1000 // 30 minutes
};

const publicCategoryCache = {
    data: null,
    timestamp: null,
    ttl: 30 * 60 * 1000 // 30 minutes
};

const ribbonCache = {
    data: null,
    timestamp: null,
    ttl: 60 * 60 * 1000 // 1 hour
};

// In-memory OTP store (in production, use Redis or database)
const otpStore = new Map();

// Clear all caches
function clearAllCaches() {
    productCache.data = null;
    productCache.timestamp = null;
    categoryCache.data = null;
    categoryCache.timestamp = null;
    publicCategoryCache.data = null;
    publicCategoryCache.timestamp = null;
    ribbonCache.data = null;
    ribbonCache.timestamp = null;
}

module.exports = {
    productCache,
    categoryCache,
    publicCategoryCache,
    ribbonCache,
    otpStore,
    clearAllCaches
};
