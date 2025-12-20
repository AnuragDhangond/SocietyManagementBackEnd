require("dotenv").config();


const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const maintenanceRoutes = require("./routes/maintenanceRoutes");

const app = express();

app.get("/", (req, res) => {
  res.send("Society Backend is Live 🚀");
});


// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect MongoDB (uses Atlas via .env)
connectDB();

// Routes
app.use("/api/members", require("./routes/memberRoutes"));
app.use("/api/signup", require("./routes/signupRoutes"));
app.use("/api/login", require("./routes/loginRoutes"));
app.use("/api/maintenance", maintenanceRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
