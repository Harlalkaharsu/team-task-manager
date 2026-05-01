const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/projectController');

router.use(authenticate);

router.get('/', getProjects);

router.post(
  '/',
  [body('name').trim().notEmpty().withMessage('Project name is required')],
  createProject
);

router.get('/:id', getProject);

router.put(
  '/:id',
  [body('name').trim().notEmpty().withMessage('Project name is required')],
  updateProject
);

router.delete('/:id', deleteProject);

router.post('/:id/members', addMember);

router.delete('/:id/members/:userId', removeMember);

module.exports = router;
