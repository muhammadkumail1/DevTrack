require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI missing in backend/.env");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const passwordPlain = "devtrack123";
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(passwordPlain, salt);

  const users = [
    {
      name: "Demo Manager",
      email: "manager@devtrack.local",
      role: "Manager",
      password,
    },
    {
      name: "Demo Developer",
      email: "dev@devtrack.local",
      role: "Developer",
      password,
    },
    {
      name: "Demo Tester",
      email: "tester@devtrack.local",
      role: "Tester",
      password,
    },
  ];

  for (const u of users) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      // keep existing account
      continue;
    }
    await User.create(u);
  }

  console.log("Seed complete.");
  console.log("Login credentials (password for all):", passwordPlain);
  console.log("- Manager:", "manager@devtrack.local");
  console.log("- Developer:", "dev@devtrack.local");
  console.log("- Tester:", "tester@devtrack.local");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

