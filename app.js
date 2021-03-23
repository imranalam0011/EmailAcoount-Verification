const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./db/connectDB");
const app = express();

const authRoutes = require("./routes/auth");

app.use(express.json());
app.use(cors());

//middleware
app.use("/api", authRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
