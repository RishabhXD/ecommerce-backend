const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const cloudinary = require("cloudinary");
const fileUpload = require("express-fileupload");

// Routes
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const order = require("./routes/orderRoute");
const { connectDB } = require("./config/db");

const app = express();

// Config
dotenv.config({ path: "backend/config/config.env" });
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(fileUpload());

// DB Connection
connectDB();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api/v1", product);
app.use("/api/v1/", user);
app.use("/api/v1/", order);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log("Server is running on port " + port);
});
