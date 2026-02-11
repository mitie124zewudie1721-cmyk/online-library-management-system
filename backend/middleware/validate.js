// backend/middleware/validate.js
/**
 * Body validation middleware
 * @param {Object} schema - Example:
 *   {
 *     username: { required: true, type: 'string', min: 3, max: 30, pattern: /^[a-zA-Z0-9_]+$/ },
 *     email: { required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
 *     role: { required: true, type: 'string', enum: ['admin', 'librarian', 'member'] },
 *     age: { type: 'number', min: 18 },
 *   }
 */
const validate = (schema) => (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
        let value = req.body[field];

        // Auto-trim strings
        if (typeof value === 'string') {
            value = value.trim();
            req.body[field] = value; // mutate request body
        }

        // Required check
        if (rules.required && (value === undefined || value === null || value === '')) {
            errors.push(`${field} is required`);
            continue;
        }

        // Skip if not required and missing
        if (value === undefined || value === null) continue;

        // Type check
        if (rules.type) {
            if (rules.type === 'string' && typeof value !== 'string') {
                errors.push(`${field} must be a string`);
            } else if (rules.type === 'number' && typeof value !== 'number') {
                errors.push(`${field} must be a number`);
            } else if (rules.type === 'boolean' && typeof value !== 'boolean') {
                errors.push(`${field} must be a boolean`);
            } else if (rules.type === 'array' && !Array.isArray(value)) {
                errors.push(`${field} must be an array`);
            } else if (rules.type === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
                errors.push(`${field} must be an object`);
            }
        }

        // Min / Max length or value
        if (rules.min !== undefined) {
            if (typeof value === 'string' && value.length < rules.min) {
                errors.push(`${field} must be at least ${rules.min} characters`);
            } else if (typeof value === 'number' && value < rules.min) {
                errors.push(`${field} must be at least ${rules.min}`);
            } else if (Array.isArray(value) && value.length < rules.min) {
                errors.push(`${field} must have at least ${rules.min} items`);
            }
        }

        if (rules.max !== undefined) {
            if (typeof value === 'string' && value.length > rules.max) {
                errors.push(`${field} must be at most ${rules.max} characters`);
            } else if (typeof value === 'number' && value > rules.max) {
                errors.push(`${field} must be at most ${rules.max}`);
            } else if (Array.isArray(value) && value.length > rules.max) {
                errors.push(`${field} must have at most ${rules.max} items`);
            }
        }

        // Enum check
        if (rules.enum && !rules.enum.includes(value)) {
            errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
        }

        // Regex / pattern check
        if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
            errors.push(`${field} has invalid format`);
        }
    }

    if (errors.length > 0) {
        // Debug log in development
        if (process.env.NODE_ENV === 'development') {
            console.warn('[VALIDATION ERROR]', {
                url: req.originalUrl,
                method: req.method,
                body: req.body,
                errors,
            });
        }

        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors,
        });
    }

    next();
};

module.exports = validate;