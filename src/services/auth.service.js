const { OAuth2Client } = require('google-auth-library');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

// Access token ngắn hạn (15 phút)
const generateToken = (userId) => {
  return jwt.sign(
    { sub: userId, iat: Math.floor(Date.now() / 1000) },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

// Refresh token dài hạn (30 ngày), dùng secret riêng
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { sub: userId },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh',
    { expiresIn: '30d' }
  );
};

// Lưu refresh token vào DB và trả về cả 2 tokens
const issueTokens = async (user) => {
  const accessToken = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save();
  return { accessToken, refreshToken };
};

// Dùng refresh token để tạo access token mới
const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) throw new ApiError(401, 'Refresh token required');

  let decoded;
  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh'
    );
  } catch (e) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.sub);
  if (!user || user.refreshToken !== refreshToken) {
    throw new ApiError(401, 'Refresh token revoked');
  }

  const accessToken = generateToken(user._id);
  return { accessToken, user };
};

const registerUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(400, 'Email already taken');
  }
  return User.create(userBody);
};

const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(401, 'Incorrect email or password');
  }
  return user;
};

const loginWithGoogle = async (idToken) => {
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const { email, name } = payload;

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ email, name });
  }
  return user;
};

const revokeRefreshToken = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

module.exports = {
  generateToken,
  generateRefreshToken,
  issueTokens,
  refreshAccessToken,
  registerUser,
  loginUserWithEmailAndPassword,
  loginWithGoogle,
  revokeRefreshToken,
};
