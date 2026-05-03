require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");

async function seedAdmin() {
  try {
    await connectDB();
    
    const existingAdmin = await User.findOne({ email: "admin@devtrack.com" });
    if (existingAdmin) {
      console.log("✓ Admin already exists: admin@devtrack.com");
      process.exit(0);
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Admin@123", salt);
    
    const admin = await User.create({
      name: "Admin",
      email: "admin@devtrack.com",
      password: hashedPassword,
      role: "Admin",
    });
    
    console.log("✓ Admin user created successfully");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Email:    admin@devtrack.com");
    console.log("Password: Admin@123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

seedAdmin();
