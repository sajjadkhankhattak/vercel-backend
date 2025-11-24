import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  userAnswers: [{
    questionId: {
      type: String,
      required: true
    },
    selectedAnswer: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    },
    timeSpent: {
      type: Number, // seconds spent on this question
      default: 0
    }
  }],
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  timeSpent: {
    type: Number, // total time spent in seconds
    required: true
  },
  timeLimitExceeded: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  attemptNumber: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Index for efficient queries
quizAttemptSchema.index({ userId: 1, quizId: 1 });
quizAttemptSchema.index({ userId: 1, completedAt: -1 });
quizAttemptSchema.index({ quizId: 1, score: -1 });

// Virtual for percentage calculation
quizAttemptSchema.virtual('percentage').get(function() {
  return Math.round((this.correctAnswers / this.totalQuestions) * 100);
});

// Method to get quiz statistics
quizAttemptSchema.statics.getQuizStats = async function(quizId) {
  const stats = await this.aggregate([
    { $match: { quizId: new mongoose.Types.ObjectId(quizId) } },
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        averageScore: { $avg: '$score' },
        highestScore: { $max: '$score' },
        averageTime: { $avg: '$timeSpent' }
      }
    }
  ]);
  
  return stats[0] || {
    totalAttempts: 0,
    averageScore: 0,
    highestScore: 0,
    averageTime: 0
  };
};

// Method to get user's quiz history
quizAttemptSchema.statics.getUserQuizHistory = async function(userId, limit = 10) {
  return await this.find({ userId })
    .populate('quizId', 'title category')
    .sort({ completedAt: -1 })
    .limit(limit);
};

export default mongoose.model('QuizAttempt', quizAttemptSchema);