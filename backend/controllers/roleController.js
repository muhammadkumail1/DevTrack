const CompanyRole = require("../models/CompanyRole");

const DEFAULT_ROLES = [
  { name: "Admin", description: "Full system access", isSystem: true },
  { name: "Manager", description: "Project management and team oversight", isSystem: true },
  { name: "Developer", description: "Software development", isSystem: true },
  { name: "Tester", description: "Quality assurance and testing", isSystem: true },
  { name: "Designer", description: "UI/UX design", isSystem: false },
  { name: "DevOps", description: "Infrastructure and deployment", isSystem: false },
  { name: "Business Analyst", description: "Requirements and process analysis", isSystem: false },
  { name: "Scrum Master", description: "Agile process facilitation", isSystem: false },
];

exports.getRoles = async (req, res) => {
  try {
    let roles = await CompanyRole.find().sort({ isSystem: -1, name: 1 });
    if (roles.length === 0) {
      roles = await CompanyRole.insertMany(DEFAULT_ROLES);
    }
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createRole = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Role name is required" });
    const exists = await CompanyRole.findOne({ name: { $regex: new RegExp("^" + name.trim() + "$", "i") } });
    if (exists) return res.status(400).json({ message: "Role already exists" });
    const role = await CompanyRole.create({ name: name.trim(), description: description || "" });
    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const role = await CompanyRole.findById(req.params.id);
    if (!role) return res.status(404).json({ message: "Role not found" });
    if (role.isSystem) return res.status(400).json({ message: "Cannot modify system roles" });
    const { name, description } = req.body;
    if (name) role.name = name.trim();
    if (description !== undefined) role.description = description;
    await role.save();
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const role = await CompanyRole.findById(req.params.id);
    if (!role) return res.status(404).json({ message: "Role not found" });
    if (role.isSystem) return res.status(400).json({ message: "Cannot delete system roles" });
    await role.deleteOne();
    res.json({ message: "Role deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
