import express from "express";
import spaceRouter from "./src/routes/spacesRoutes.js";

const app = express();
const PORT = 8080;
const HOST = "0.0.0.0";

// middleware for json support.
app.use(express.json());

/****** SETUP ROUTERS HERE ******/
app.use("/spaces", spaceRouter);
//app.use('/containers', containerRouter);

// handle homepage route.
app.get("/", (req, res) => {
  res.send("Hello Backend!");
});

// Start the server and listen for connections
app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
