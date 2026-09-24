const mongoose = require('mongoose');
const Goal = require('../models/Goal');
const StudySession = require('../models/StudySession');
const SyllabusTopic = require('../models/SyllabusTopic');
const TestAnalytics = require('../models/TestAnalytics');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const owned = (userId, id) => ({ _id: id, userId });

const createTask = async (req, res) => {
  try {
    const task = await Goal.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, task });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const listTasks = async (req, res) => {
  try {
    const filter = { userId: req.user._id, isDeleted: false };
    if (req.query.completed !== undefined) filter.completed = req.query.completed === 'true';
    const tasks = await Goal.find(filter).sort({ completed: 1, dueDate: 1, createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid task ID' });
    const allowed = ['title', 'subject', 'description', 'priority', 'type', 'progress', 'target', 'dueDate', 'tags', 'timeSpent', 'sessionsCompleted'];
    const updates = Object.fromEntries(allowed.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]]));
    if (updates.progress !== undefined) {
      updates.completed = updates.progress >= 100;
      updates.completedAt = updates.completed ? new Date() : null;
    }
    const task = await Goal.findOneAndUpdate(owned(req.user._id, req.params.id), updates, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    res.json({ success: true, task });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid task ID' });
    const task = await Goal.findOneAndUpdate(owned(req.user._id, req.params.id), { isDeleted: true }, { new: true });
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const logSession = async (req, res) => {
  try {
    const session = await StudySession.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, session });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const listSessions = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const sessions = await StudySession.find({ userId: req.user._id }).sort({ date: -1 }).limit(limit);
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createTopic = async (req, res) => {
  try {
    const topic = await SyllabusTopic.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, topic });
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 400).json({ success: false, error: error.message });
  }
};

const listTopics = async (req, res) => {
  try {
    const filter = { userId: req.user._id };
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.status) filter.status = req.query.status;
    const topics = await SyllabusTopic.find(filter).sort({ subject: 1, chapter: 1, name: 1 });
    res.json({ success: true, topics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateTopic = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid topic ID' });
    const allowed = ['subject', 'chapter', 'name', 'status', 'progress', 'priority', 'estimatedMinutes', 'notes'];
    const updates = Object.fromEntries(allowed.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]]));
    if (updates.progress >= 100) updates.completedAt = new Date();
    const topic = await SyllabusTopic.findOneAndUpdate(owned(req.user._id, req.params.id), updates, { new: true, runValidators: true });
    if (!topic) return res.status(404).json({ success: false, error: 'Topic not found' });
    res.json({ success: true, topic });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const deleteTopic = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid topic ID' });
    const topic = await SyllabusTopic.findOneAndDelete(owned(req.user._id, req.params.id));
    if (!topic) return res.status(404).json({ success: false, error: 'Topic not found' });
    res.json({ success: true, message: 'Topic deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const recordTest = async (req, res) => {
  try {
    const analytics = await TestAnalytics.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, analytics });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const listTestAnalytics = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const analytics = await TestAnalytics.find({ userId: req.user._id }).sort({ takenAt: -1 }).limit(limit);
    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getTestSummary = async (req, res) => {
  try {
    const [summary] = await TestAnalytics.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user._id) } },
      { $group: { _id: null, tests: { $sum: 1 }, totalQuestions: { $sum: '$totalQuestions' }, totalCorrect: { $sum: '$correct' }, averagePercentage: { $avg: '$percentage' }, averageAccuracy: { $avg: { $cond: [{ $gt: ['$attempted', 0] }, { $multiply: [{ $divide: ['$correct', '$attempted'] }, 100] }, 0] } } } },
      { $project: { _id: 0, tests: 1, totalQuestions: 1, totalCorrect: 1, averagePercentage: { $round: ['$averagePercentage', 2] }, averageAccuracy: { $round: ['$averageAccuracy', 2] } } }
    ]);
    res.json({ success: true, summary: summary || { tests: 0, totalQuestions: 0, totalCorrect: 0, averagePercentage: 0, averageAccuracy: 0 } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { createTask, listTasks, updateTask, deleteTask, logSession, listSessions, createTopic, listTopics, updateTopic, deleteTopic, recordTest, listTestAnalytics, getTestSummary };
