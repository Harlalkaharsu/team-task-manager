const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

const getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id } } },
        ],
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true, members: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description } = req.body;

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        ownerId: req.user.id,
        members: {
          create: { userId: req.user.id, role: 'ADMIN' },
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true, members: true } },
      },
    });

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id } } },
        ],
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
          orderBy: { joinedAt: 'asc' },
        },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
            creator: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;

    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id, role: 'ADMIN' } } },
        ],
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or insufficient permissions' });
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        name: req.body.name?.trim(),
        description: req.body.description?.trim() ?? project.description,
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true, members: true } },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findFirst({
      where: { id, ownerId: req.user.id },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or only owner can delete' });
    }

    await prisma.project.delete({ where: { id } });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id, role: 'ADMIN' } } },
        ],
      },
    });

    if (!project) {
      return res.status(403).json({ error: 'Only project admins can add members' });
    }

    const userToAdd = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!userToAdd) {
      return res.status(404).json({ error: 'User with that email not found' });
    }

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: userToAdd.id } },
    });

    if (existing) {
      return res.status(409).json({ error: 'User is already a member' });
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId: id,
        userId: userToAdd.id,
        role: role === 'ADMIN' ? 'ADMIN' : 'MEMBER',
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    res.status(201).json(member);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id, role: 'ADMIN' } } },
        ],
      },
    });

    if (!project) {
      return res.status(403).json({ error: 'Only project admins can remove members' });
    }

    if (userId === project.ownerId) {
      return res.status(400).json({ error: 'Cannot remove the project owner' });
    }

    await prisma.projectMember.deleteMany({
      where: { projectId: id, userId },
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
