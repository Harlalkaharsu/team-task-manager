const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const projectFilter = {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
      ],
    };

    const taskProjectFilter = {
      project: projectFilter,
    };

    const [
      totalProjects,
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      overdueTasks,
      recentTasks,
    ] = await Promise.all([
      prisma.project.count({ where: projectFilter }),
      prisma.task.count({ where: taskProjectFilter }),
      prisma.task.count({ where: { ...taskProjectFilter, status: 'TODO' } }),
      prisma.task.count({ where: { ...taskProjectFilter, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { ...taskProjectFilter, status: 'DONE' } }),
      prisma.task.count({
        where: {
          ...taskProjectFilter,
          status: { not: 'DONE' },
          dueDate: { lt: now },
        },
      }),
      prisma.task.findMany({
        where: taskProjectFilter,
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
    ]);

    res.json({
      stats: {
        totalProjects,
        totalTasks,
        todoTasks,
        inProgressTasks,
        doneTasks,
        overdueTasks,
      },
      recentTasks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getUsers, getDashboard };
