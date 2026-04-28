import bcrypt from 'bcrypt';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';
import { validateEmail, isNonEmptyString } from '../utils/validators.js';

export const registerUser = async (req, res) => {
  try {
    const username = req.body.username || req.body.name;
    const { email, password } = req.body;

    if (!isNonEmptyString(username) || !validateEmail(email) || !isNonEmptyString(password)) {
      return sendError(res, 'Please provide a valid username, email, and password', 400);
    }

    if (username.trim().length < 3) {
      return sendError(res, 'Username must be at least 3 characters long', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ $or: [{ email: normalizedEmail }, { username: username.trim() }] });
    if (existingUser) {
      return sendError(res, 'Username or email already exists', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({ username: username.trim(), email: normalizedEmail, passwordHash });
    await newUser.save();

    const token = generateToken(newUser._id);
    return sendSuccess(res, {
      token,
      user: {
        id: newUser._id,
        name: newUser.username,
        email: newUser.email,
      },
    }, 'User registered successfully', 201);
  } catch (error) {
    console.error('Error registering user:', error.message);
    return sendError(res, 'Server error', 500);
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!validateEmail(email) || !isNonEmptyString(password)) {
      return sendError(res, 'Please provide a valid email and password', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return sendError(res, 'Invalid email or password', 400);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 400);
    }

    const token = generateToken(user._id);
    return sendSuccess(res, {
      token,
      user: {
        id: user._id,
        name: user.username,
        email: user.email,
      },
    }, 'User logged in successfully');
  } catch (error) {
    console.error('Error logging in user:', error.message);
    return sendError(res, 'Server error', 500);
  }
};

export const getMe = async (req, res) => {
  return sendSuccess(res, { user: req.user }, 'Authenticated user fetched successfully');
};