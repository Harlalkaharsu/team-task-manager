const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');

router.use(authenticate);

router.get('/project/:projectId', getTasks);

router.post(
  '/project/:projectId',
  [body('title').trim().notEmpty().withMessage('Task title is required')],
  createTask
);

router.put('/:id', updateTask);

router.delete('/:id', deleteTask);

module.exports = router;
