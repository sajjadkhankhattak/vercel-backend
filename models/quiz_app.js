import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// =====================
// QUIZ MODEL
// =====================
const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options:      { type: [String], required: true },
  correctAnswer: { type: String, required: true }
});

const quizSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  category:    { type: String, required: true },
  tags:        { type: [String] },
  duration:    { type: Number },
  difficulty:  { type: String },
  questions:   { type: [questionSchema], required: true },
  image:       { 
    type: String, // Store as base64 string or URL
    required: false 
  },
  imageType:   { 
    type: String, // Store MIME type (image/jpeg, image/png, etc.)
    required: false 
  }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
export const Quiz = mongoose.model('Quiz', quizSchema);
