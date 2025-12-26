const express = require('express');
const router = express.Router();
const { odooApiCall } = require('../utils/odoo');
const { otpStore } = require('../utils/cache');
const { GCC_COUNTRIES } = require('../config');

// Generate 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Get list of GCC countries for frontend
router.get('/countries', (req, res) => {
    res.json({
        success: true,
        countries: Object.entries(GCC_COUNTRIES).map(([code, data]) => ({
            code,
            ...data
        }))
    });
});

// Send OTP to phone number
router.post('/send-otp', async (req, res) => {
    try {
        const { phone, countryCode } = req.body;

        if (!GCC_COUNTRIES[countryCode]) {
            return res.status(400).json({
                error: 'Verification is only available for GCC countries'
            });
        }

        if (!phone || phone.length < 8) {
            return res.status(400).json({
                error: 'Please enter a valid phone number'
            });
        }

        const countryDialCode = GCC_COUNTRIES[countryCode].code;
        const cleanPhone = phone.replace(/\D/g, '');
        const fullPhone = `${countryDialCode}${cleanPhone}`;

        const otp = generateOTP();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

        otpStore.set(fullPhone, {
            otp,
            expiresAt,
            countryCode,
            attempts: 0
        });

        // TODO: Integrate with WhatsApp Business API
        console.log(`OTP for ${fullPhone}: ${otp}`);

        const isDev = process.env.NODE_ENV !== 'production';

        res.json({
            success: true,
            message: `OTP sent to ${GCC_COUNTRIES[countryCode].code} ${phone}`,
            phone: fullPhone,
            ...(isDev && { devOtp: otp })
        });

    } catch (error) {
        console.error('Send OTP error:', error.message);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// Verify OTP
router.post('/check-otp', async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ error: 'Phone and OTP are required' });
        }

        const stored = otpStore.get(phone);

        if (!stored) {
            return res.status(400).json({ error: 'OTP expired or not found. Please request a new one.' });
        }

        if (Date.now() > stored.expiresAt) {
            otpStore.delete(phone);
            return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
        }

        if (stored.attempts >= 3) {
            otpStore.delete(phone);
            return res.status(400).json({ error: 'Too many attempts. Please request a new OTP.' });
        }

        if (stored.otp !== otp) {
            stored.attempts++;
            return res.status(400).json({
                error: 'Invalid OTP. Please try again.',
                attemptsRemaining: 3 - stored.attempts
            });
        }

        const countryCode = stored.countryCode;
        otpStore.delete(phone);

        // Find or create customer and mark as verified
        try {
            const existingCustomers = await odooApiCall('res.partner', 'search_read',
                [[['phone', '=', phone]]],
                { fields: ['id', 'name', 'comment'], limit: 1 }
            );

            if (existingCustomers && existingCustomers.length > 0) {
                const customerId = existingCustomers[0].id;
                const existingComment = existingCustomers[0].comment || '';
                const newComment = existingComment.includes('VERIFIED')
                    ? existingComment
                    : `${existingComment}\n[VERIFIED] Phone verified on ${new Date().toISOString()}`;

                await odooApiCall('res.partner', 'write', [[customerId], {
                    comment: newComment.trim()
                }]);
            } else {
                await odooApiCall('res.partner', 'create', [{
                    name: `Verified User (${phone})`,
                    phone: phone,
                    comment: `Country: ${GCC_COUNTRIES[countryCode].name}\n[VERIFIED] Phone verified on ${new Date().toISOString()}`,
                    customer_rank: 1
                }]);
            }
        } catch (odooError) {
            console.error('Odoo verification update error:', odooError.message);
        }

        const verificationToken = Buffer.from(`${phone}:${Date.now()}:verified`).toString('base64');

        res.json({
            success: true,
            verified: true,
            message: 'Phone number verified successfully!',
            phone: phone,
            countryCode: countryCode,
            token: verificationToken
        });

    } catch (error) {
        console.error('Verify OTP error:', error.message);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
});

// Check if a phone is verified
router.get('/status', async (req, res) => {
    try {
        const { phone } = req.query;

        if (!phone) {
            return res.status(400).json({ error: 'Phone number is required' });
        }

        const customers = await odooApiCall('res.partner', 'search_read',
            [[['phone', '=', phone]]],
            { fields: ['id', 'name', 'comment'], limit: 1 }
        );

        if (customers && customers.length > 0) {
            const comment = customers[0].comment || '';
            const isVerified = comment.includes('[VERIFIED]');

            res.json({
                success: true,
                verified: isVerified,
                phone: phone
            });
        } else {
            res.json({
                success: true,
                verified: false,
                phone: phone
            });
        }

    } catch (error) {
        console.error('Check verification status error:', error.message);
        res.status(500).json({ error: 'Failed to check verification status' });
    }
});

module.exports = router;
