const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createTask, listTasks, updateTask, deleteTask,
  logSession, listSessions,
  createTopic, listTopics, updateTopic, deleteTopic,
  recordTest, listTestAnalytics, getTestSummary
} = require('../controllers/learningController');

const router = express.Router();
router.use(protect);

router.route('/tasks').post(createTask).get(listTasks);
router.route('/tasks/:id').patch(updateTask).delete(deleteTask);

router.route('/sessions').post(logSession).get(listSessions);

router.route('/topics').post(createTopic).get(listTopics);
router.route('/topics/:id').patch(updateTopic).delete(deleteTopic);

router.post('/tests', recordTest);
router.get('/tests', listTestAnalytics);
router.get('/tests/summary', getTestSummary);

module.exports = router;
