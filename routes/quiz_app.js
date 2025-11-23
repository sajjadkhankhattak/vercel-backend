import express from 'express';
const router = express.Router();
import { signup, login, createQuiz, getQuizzes, updateQuiz, deleteQuiz, getAllUsers} from '../controller/quiz_app.js';

// Auth routes
router.post('/signup', signup);
router.post('/login', login);

// User routes
router.get('/users', getAllUsers);

// Quiz routes
router.post('/quiz', createQuiz);
router.get('/quiz', getQuizzes);
router.put('/quiz/:id', updateQuiz);
router.delete('/quiz/:id', deleteQuiz);

export default router;
