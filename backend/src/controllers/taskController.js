const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

const isMemberOfProject = async (userId, projectId) => {
  const member = await prisma.projectMember.findFirst({
    where: { projectId, userId },
  });
  if (member) return true;
  const owner = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
  });
  return !!owner;
};

const getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    const hasAccess = await isMemberOfProject(req.user.id, projectId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Not a member of this project' });
    }

    const { status, priority, assigneeId } = req.query;
    const where = { projectId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { projectId } = req.params;
    const { title, description, assigneeId, priority, dueDate } = req.body;

    const hasAccess = await isMemberOfProject(req.user.id, projectId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Not a member of this project' });
    }

    // Validate assignee is a project member if provided
    if (assigneeId) {
      const assigneeIsMember = await isMemberOfProject(assigneeId, projectId);
      if (!assigneeIsMember) {
        return res.status(400).json({ error: 'Assignee must be a project member' });
      }
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        creatorId: req.user.id,
        assigneeId: assigneeId || null,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate, assigneeId } = req.body;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          include: { members: true },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const isMember = task.project.members.some((m) => m.userId === req.user.id);
    const isOwner = task.project.ownerId === req.user.id;

    if (!isMember && !isOwner) {
      return res.status(403).json({ error: 'Not a member of this project' });
    }

    const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority value' });
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const isCreator = task.creatorId === req.user.id;
    const isProjectOwner = task.project.ownerId === req.user.id;
    const isProjectAdmin = await prisma.projectMember.findFirst({
      where: { projectId: task.projectId, userId: req.user.id, role: 'ADMIN' },
    });

    if (!isCreator && !isProjectOwner && !isProjectAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this task' });
    }

    await prisma.task.delete({ where: { id } });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
