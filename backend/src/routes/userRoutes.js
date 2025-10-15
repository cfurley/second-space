import express from "express";
const userRouter = express.Router();
import userController from "../controllers/userControllers.js";

// Define routes
userRouter.get("/authentication/", userController.getAllUsers); //
userRouter.get("/password/", userController.getById); //
userRouter.post("/", userController.createUser); //
userRouter.put("/:id", userController.updateUser); //
userRouter.delete("/:id", userController.deleteUser); //

export default userRouter;
