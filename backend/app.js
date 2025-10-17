import express from "express";
import spaceRouter from "./src/routes/spacesRoutes.js";
// import mediaRouter from "./src/routes/mediaRoutes.js";
import userRouter from "./src/routes/userRoutes.js";

const app = express();
const PORT = 8080;
const HOST = "0.0.0.0";

// middleware for json support.
app.use(express.json());

/****** SETUP ROUTERS HERE ******/
app.use("/spaces", spaceRouter);
// app.use("/media", mediaRouter);
app.use("/user", userRouter);
//app.use('/containers', containerRouter);

// handle homepage route.
app.get("/", (req, res) => {
  res.send("Hello Backend!");
});

// Start the server and listen for connections
app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
