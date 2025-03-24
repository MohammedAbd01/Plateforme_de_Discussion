const { body, validationResult } = require('express-validator');

const validateRegistration = [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

const validateLogin = [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
];

const validateMessage = [
    body('content').notEmpty().withMessage('Message content cannot be empty'),
    body('roomId').notEmpty().withMessage('Room ID is required'),
];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    validateRegistration,
    validateLogin,
    validateMessage,
    validate,
};