const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { getUsers, getDashboard } = require('../controllers/userController');

router.use(authenticate);

router.get('/dashboard', getDashboard);

router.get('/', requireRole('ADMIN'), getUsers);

module.exports = router;
