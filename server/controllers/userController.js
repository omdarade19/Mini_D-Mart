const User = require('../models/User');
const logAudit = require('../middleware/auditLogger');

// GET /api/users (Admin only)
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/:id/role (Admin only)
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const allowedRoles = ['customer', 'staff', 'admin'];

    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: `Role must be one of: ${allowedRoles.join(', ')}` });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent demoting self if sole admin
    if (user._id.toString() === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'You cannot change your own admin role' });
    }

    const previousRole = user.role;
    user.role = role;
    await user.save();

    logAudit('UPDATE_USER_ROLE', req.user, { targetUserId: user._id, previousRole, newRole: role });

    res.json({
      success: true,
      message: `User role updated from ${previousRole} to ${role}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  updateUserRole
};
