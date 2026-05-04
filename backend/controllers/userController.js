const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Project = require("../models/Project");

exports.getUsers = async (req, res) => {
  try {
    if (req.user.role === "Admin") {
      // Admin sees everyone
      const users = await User.find().select("-password").sort({ name: 1 });
      return res.json(users);
    }
    // Manager and Developer: see only members of their accessible projects
    let projectFilter = {};
    if (req.user.role === "Manager") {
      projectFilter.$or = [{ manager: req.user._id }, { members: req.user._id }];
    } else {
      projectFilter.members = req.user._id;
    }
    const projects = await Project.find(projectFilter).populate("members", "name email role").populate("manager", "name email role");
    const memberMap = {};
    projects.forEach((p) => {
      if (p.manager) memberMap[p.manager._id.toString()] = p.manager;
      (p.members || []).forEach((m) => { memberMap[m._id.toString()] = m; });
    });
    const users = Object.values(memberMap).sort((a, b) => a.name.localeCompare(b.name));
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Please provide all fields" });
    }
    // Admin accounts can only be created via direct database access / seeding
    if (role === "Admin") {
      return res.status(403).json({ message: "Admin accounts cannot be created through the application. Please use database seeding." });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "Developer",
    });
    const populated = await User.findById(user._id).select("-password");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Admin accounts cannot be modified through the application
    if (user.role === "Admin") {
      return res.status(403).json({ message: "Admin accounts cannot be modified through the application." });
    }

    // Also prevent promoting another user to Admin via API
    if (req.body.role === "Admin") {
      return res.status(403).json({ message: "Cannot assign Admin role through the application." });
    }

    const { name, email, role, password } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    await user.save();
    const populated = await User.findById(user._id).select("-password");
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Admin accounts cannot be deleted through the application
    if (user.role === "Admin") {
      return res.status(403).json({ message: "Admin accounts cannot be deleted through the application." });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
