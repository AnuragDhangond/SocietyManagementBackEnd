require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const expenseRoutes = require('./routes/expenseRoutes');
const connectDB = require("./config/db");

const app = express();

// BASIC CHECK
app.get("/", (req, res) => {
  res.send("Society Backend is Live 🚀");
});

// MIDDLEWARE
app.use(cors());
app.use(bodyParser.json());

// DATABASE
connectDB();

// ROUTES
app.use("/api/members", require("./routes/memberRoutes"));
app.use("/api/signup", require("./routes/signupRoutes"));
app.use("/api/login", require("./routes/loginRoutes"));
app.use("/api/maintenance", require("./routes/maintenanceRoutes"));
app.use("/api/complaints", require("./routes/complaintRoutes"));
app.use('/api/expenses', expenseRoutes);

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
