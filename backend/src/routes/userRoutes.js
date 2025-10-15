import express from "express";
const userRouter = express.Router();
import userController from "../controllers/userControllers.js";

// Define routes
userRouter.get("/authentication/", userController.getAllUsers); // get users by the user id
userRouter.get("/password/", userController.getById); // get users by user
userRouter.post("/", userController.createUser); //
userRouter.put("/:id", userController.updateUser); // PUT /controllers/:id
userRouter.delete("/:id", userController.deleteUser); // DELETE /controllers/:id

export default userRouter;
