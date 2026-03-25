const catchAsync = require('../utils/catchAsync');
const authService = require('../services/auth.service');

const register = catchAsync(async (req, res) => {
  const user = await authService.registerUser(req.body);
  const { accessToken, refreshToken } = await authService.issueTokens(user);
  res.status(201).json({ success: true, user, token: accessToken, refreshToken });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const { accessToken, refreshToken } = await authService.issueTokens(user);
  res.json({ success: true, user, token: accessToken, refreshToken });
});

const googleLogin = catchAsync(async (req, res) => {
  const { idToken } = req.body;
  const user = await authService.loginWithGoogle(idToken);
  const { accessToken, refreshToken } = await authService.issueTokens(user);
  res.json({ success: true, user, token: accessToken, refreshToken });
});

// Dùng refreshToken để lấy accessToken mới
const refresh = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  const { accessToken, user } = await authService.refreshAccessToken(refreshToken);
  res.json({ success: true, token: accessToken, user });
});

// Logout: revoke refresh token
const logout = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    const authService2 = require('../services/auth.service');
    // Decode để lấy userId mà không cần verify full (token có thể đã expired)
    const jwt = require('jsonwebtoken');
    try {
      const decoded = jwt.decode(refreshToken);
      if (decoded?.sub) {
        await authService2.revokeRefreshToken(decoded.sub);
      }
    } catch (_) {}
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = {
  register,
  login,
  googleLogin,
  refresh,
  logout,
};
