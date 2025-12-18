require("dotenv").config();


const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect MongoDB (uses Atlas via .env)
connectDB();

// Routes
app.use("/api/members", require("./routes/memberRoutes"));
app.use("/api/signup", require("./routes/signupRoutes"));
app.use("/api/login", require("./routes/loginRoutes"));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
