import express from "express";
const userRouter = express.Router();
import userController from "../controllers/userControllers.js";

// Define routes
userRouter.post("/authentication", userController.authenticate); // Changed to POST for login
userRouter.put("/password", userController.updatePassword); //
userRouter.post("/", userController.createUser); //
userRouter.put("/:id", userController.updateUser); //
userRouter.delete("/:id", userController.deleteUser); //

export default userRouter;
