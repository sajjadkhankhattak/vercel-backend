import QuizAttempt from '../models/QuizAttempt.js';
import Quiz from '../models/quiz_app.js';
import mongoose from 'mongoose';

// SUBMIT QUIZ ATTEMPT
export const submitQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { userAnswers, timeSpent, timeLimitExceeded } = req.body;
    const userId = req.user.id;

    console.log("✅ SUBMIT QUIZ - Quiz ID:", quizId);
    console.log("✅ SUBMIT QUIZ - User ID:", userId);
    console.log("✅ SUBMIT QUIZ - Answers:", userAnswers?.length);

    // Validate required fields
    if (!userAnswers || !Array.isArray(userAnswers) || userAnswers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User answers are required"
      });
    }

    if (!timeSpent || timeSpent <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid time spent is required"
      });
    }

    // Get the quiz to validate answers
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }

    // Check how many times user has attempted this quiz
    const previousAttempts = await QuizAttempt.countDocuments({ userId, quizId });
    const attemptNumber = previousAttempts + 1;

    // Calculate score
    let correctAnswers = 0;
    const processedAnswers = [];

    for (const userAnswer of userAnswers) {
      const question = quiz.questions.find(q => q._id.toString() === userAnswer.questionId);
      
      if (!question) {
        return res.status(400).json({
          success: false,
          message: `Question ${userAnswer.questionId} not found in quiz`
        });
      }

      const isCorrect = question.correctAnswer === userAnswer.selectedAnswer;
      if (isCorrect) correctAnswers++;

      processedAnswers.push({
        questionId: userAnswer.questionId,
        selectedAnswer: userAnswer.selectedAnswer,
        isCorrect: isCorrect,
        timeSpent: userAnswer.timeSpent || 0
      });
    }

    const totalQuestions = quiz.questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Create quiz attempt record
    const quizAttempt = new QuizAttempt({
      userId,
      quizId,
      userAnswers: processedAnswers,
      score,
      totalQuestions,
      correctAnswers,
      timeSpent,
      timeLimitExceeded: timeLimitExceeded || false,
      attemptNumber
    });

    await quizAttempt.save();

    console.log("✅ Quiz attempt saved:", quizAttempt._id);

    // Populate quiz info for response
    await quizAttempt.populate('quizId', 'title category duration');

    res.status(201).json({
      success: true,
      message: "Quiz attempt submitted successfully!",
      result: {
        attemptId: quizAttempt._id,
        score: quizAttempt.score,
        correctAnswers: quizAttempt.correctAnswers,
        totalQuestions: quizAttempt.totalQuestions,
        percentage: Math.round((correctAnswers / totalQuestions) * 100),
        timeSpent: quizAttempt.timeSpent,
        attemptNumber: quizAttempt.attemptNumber,
        quiz: quizAttempt.quizId,
        completedAt: quizAttempt.completedAt
      }
    });

  } catch (error) {
    console.error("❌ Submit quiz attempt error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit quiz attempt",
      error: error.message
    });
  }
};

// GET QUIZ ATTEMPT RESULT
export const getQuizAttemptResult = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    console.log("✅ GET RESULT - Attempt ID:", attemptId);
    console.log("✅ GET RESULT - User ID:", userId);

    const attempt = await QuizAttempt.findOne({ _id: attemptId, userId })
      .populate('quizId', 'title category description duration questions');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Quiz attempt not found"
      });
    }

    // Prepare detailed results with correct answers
    const detailedResults = attempt.userAnswers.map(userAnswer => {
      const question = attempt.quizId.questions.find(
        q => q._id.toString() === userAnswer.questionId
      );
      
      return {
        questionId: userAnswer.questionId,
        question: question?.question || 'Question not found',
        options: question?.options || [],
        userAnswer: userAnswer.selectedAnswer,
        correctAnswer: question?.correctAnswer,
        isCorrect: userAnswer.isCorrect,
        timeSpent: userAnswer.timeSpent
      };
    });

    res.json({
      success: true,
      result: {
        attemptId: attempt._id,
        quiz: {
          title: attempt.quizId.title,
          category: attempt.quizId.category,
          description: attempt.quizId.description,
          duration: attempt.quizId.duration
        },
        score: attempt.score,
        correctAnswers: attempt.correctAnswers,
        totalQuestions: attempt.totalQuestions,
        percentage: Math.round((attempt.correctAnswers / attempt.totalQuestions) * 100),
        timeSpent: attempt.timeSpent,
        timeLimitExceeded: attempt.timeLimitExceeded,
        attemptNumber: attempt.attemptNumber,
        completedAt: attempt.completedAt,
        detailedResults
      }
    });

  } catch (error) {
    console.error("❌ Get quiz result error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get quiz result",
      error: error.message
    });
  }
};

// GET USER'S QUIZ ATTEMPTS HISTORY
export const getUserQuizHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, page = 1 } = req.query;

    console.log("✅ GET HISTORY - User ID:", userId);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const attempts = await QuizAttempt.find({ userId })
      .populate('quizId', 'title category image')
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalAttempts = await QuizAttempt.countDocuments({ userId });

    res.json({
      success: true,
      attempts: attempts.map(attempt => ({
        attemptId: attempt._id,
        quiz: {
          id: attempt.quizId._id,
          title: attempt.quizId.title,
          category: attempt.quizId.category,
          image: attempt.quizId.image
        },
        score: attempt.score,
        percentage: Math.round((attempt.correctAnswers / attempt.totalQuestions) * 100),
        timeSpent: attempt.timeSpent,
        attemptNumber: attempt.attemptNumber,
        completedAt: attempt.completedAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalAttempts / parseInt(limit)),
        totalAttempts,
        hasNext: skip + attempts.length < totalAttempts,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error("❌ Get user quiz history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get quiz history",
      error: error.message
    });
  }
};

// GET QUIZ ATTEMPTS FOR SPECIFIC QUIZ
export const getQuizAttempts = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    console.log("✅ GET QUIZ ATTEMPTS - Quiz ID:", quizId);
    console.log("✅ GET QUIZ ATTEMPTS - User ID:", userId);

    const attempts = await QuizAttempt.find({ userId, quizId })
      .sort({ completedAt: -1 });

    const bestAttempt = attempts.length > 0 
      ? attempts.reduce((best, current) => 
          current.score > best.score ? current : best
        )
      : null;

    res.json({
      success: true,
      attempts: attempts.map(attempt => ({
        attemptId: attempt._id,
        score: attempt.score,
        percentage: Math.round((attempt.correctAnswers / attempt.totalQuestions) * 100),
        timeSpent: attempt.timeSpent,
        attemptNumber: attempt.attemptNumber,
        completedAt: attempt.completedAt
      })),
      totalAttempts: attempts.length,
      bestScore: bestAttempt?.score || 0,
      canRetake: true // Users can always retake quizzes
    });

  } catch (error) {
    console.error("❌ Get quiz attempts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get quiz attempts",
      error: error.message
    });
  }
};

// GET QUIZ LEADERBOARD
export const getQuizLeaderboard = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { limit = 10 } = req.query;

    console.log("✅ GET LEADERBOARD - Quiz ID:", quizId);

    const leaderboard = await QuizAttempt.aggregate([
      { $match: { quizId: new mongoose.Types.ObjectId(quizId) } },
      {
        $group: {
          _id: '$userId',
          bestScore: { $max: '$score' },
          bestTime: { $min: '$timeSpent' },
          totalAttempts: { $sum: 1 },
          lastAttempt: { $max: '$completedAt' }
        }
      },
      { $sort: { bestScore: -1, bestTime: 1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          userName: '$user.name',
          userEmail: '$user.email',
          bestScore: 1,
          bestTime: 1,
          totalAttempts: 1,
          lastAttempt: 1
        }
      }
    ]);

    res.json({
      success: true,
      leaderboard
    });

  } catch (error) {
    console.error("❌ Get quiz leaderboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get quiz leaderboard",
      error: error.message
    });
  }
};