const express = require("express");
const spaceRouter = express.Router();
const spaceController = require("../controllers/spaceControllers");

// Define routes
router.get("/users/:id", spaceController.getAllSpaces); // get spaces by the user id
router.get("/:id", spaceController.getById); // get spaces by space
router.post("/", spaceController.createSpace); //
router.put("/:id", spaceController.updateSpace); // PUT /controllers/:id
router.delete("/:id", spaceController.deleteSpace); // DELETE /controllers/:id

export default spaceRouter;
