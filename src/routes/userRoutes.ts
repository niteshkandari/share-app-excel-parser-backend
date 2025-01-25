import { Router } from "express";
import UserController from "../controllers/userController";
// import { checkAuthentication } from "../middleware/auth";

const router:Router = Router();

router.post("/signup", UserController.userSignUp);

router.post("/signin", UserController.userSignin);

router.post("/forgot-password", UserController.forgotPassword);

router.get("/reset-password/:id/:token", (req, res, next) => UserController.resetPassword("GET",req, res, next));

router.post("/reset-password/:id/:token", (req, res, next) => UserController.resetPassword("POST",req, res, next));

// router.patch("/updatePlan", UserController.updatePlan);

export default router;
