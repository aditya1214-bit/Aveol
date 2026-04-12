const { body, validationResult } = require('express-validator');

// ── Validation result handler ─────────────────────────────────────────────────
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── Audit form validation ─────────────────────────────────────────────────────
const validateAuditSubmission = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Must be a valid email address.')
    .normalizeEmail(),

  body('companyName')
    .trim()
    .notEmpty().withMessage('Company name is required.')
    .isLength({ max: 150 }).withMessage('Company name too long.'),

  body('industry')
    .notEmpty().withMessage('Industry is required.'),

  body('teamSize')
    .optional(),

  body('biggestBottlenecks')
    .optional()
    .isLength({ max: 1000 }).withMessage('Max 1000 characters.'),

  body('repetitiveTasks')
    .optional()
    .isLength({ max: 1000 }).withMessage('Max 1000 characters.'),

  body('automationGoals')
    .optional()
    .isLength({ max: 1000 }).withMessage('Max 1000 characters.'),

  body('budgetRange')
    .optional(),

  handleValidationErrors,
];

// ── Waitlist validation ───────────────────────────────────────────────────────
const validateWaitlist = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Must be a valid email address.')
    .normalizeEmail(),
  handleValidationErrors,
];

// ── Admin auth validation ─────────────────────────────────────────────────────
const validateAdminLogin = [
  body('email').trim().isEmail().withMessage('Valid email required.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
  handleValidationErrors,
];

const validateAdminRegister = [
  body('name').trim().notEmpty().isLength({ min: 2 }).withMessage('Name required.'),
  body('email').trim().isEmail().withMessage('Valid email required.').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  body('registrationCode').notEmpty().withMessage('Registration code required.'),
  handleValidationErrors,
];

module.exports = {
  validateAuditSubmission,
  validateWaitlist,
  validateAdminLogin,
  validateAdminRegister,
};
