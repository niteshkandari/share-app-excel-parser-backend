/* eslint-disable prefer-const */
import { Request, Response, NextFunction } from "express";
import { GeneratePassword, GenerateSalt, ValidatePassword } from "../utils";
import jwt from "jsonwebtoken";
import { APP_SECRET } from "../config";
import ejs from "ejs";
import path from "path";
import { sendMail } from "../utils/mailService";
import { BadRequestException } from "../exceptions/bad-request";
import { ErrorCodes } from "../exceptions/root";
import prismaClient from "../prismaClient";

import { logger } from "../config/logger";

import bcrypt from "bcrypt";

interface OTPEntry {
  otp: string;
  timestamp: number;
}

interface OTPRequest {
  phoneNumber: string;
  otp: string;
  id: string;
}

let otps: Record<string, OTPEntry> = {};
const OTP_VALIDITY_DURATION = 2 * 60 * 1000; // * 2 minutes
const EMAIL_VALIDITY_DURATION = 5 * 60 * 1000; // * 5 minutes
class UserController {
  async userSignUp(req: Request, res: Response, next: NextFunction) {
    const {
      email,
      password: userPassword,
      name
    } = req.body;

    try {
      const existingUser = await prismaClient.user.findUnique({
        where: { email: email },
      });
      if (existingUser) {
        logger.error({ message: "user already exists", email: email });
        next(
          new BadRequestException("user already exists", ErrorCodes.USER_ALREADY_EXIST)
        );
        // return res
        //   .status(401)
        //   .json({ message: "User already exists with given email id" });
      }

      const salt = await GenerateSalt();
      const password = await GeneratePassword(userPassword, salt);

      await prismaClient.user.create({
        data: {
          email,
          password,
           name
        },
      });
      logger.info({ message: "user created", email: email });
      res.status(200).json("User Created");
    } catch (err: any) {
      console.log(err.message);
      logger.error({
        message: "Unable to Create Customer Error 500",
        email: email,
      });
      res.status(500).json({ Error: err.message });
      // throw new ApiError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Create Customer')
    }
  }

  userSignin(req: Request, res: Response) {
    const { email, password: enteredPassword } = req.body;
    prismaClient.user
      .findUnique({ where: { email } })
      .then(async (user: any) => {
        if (!user) {
          logger.error({ message: "User not found", email: email });
          return res.status(404).json({ message: "There is no user with that email" });
        } else {
          ValidatePassword(
            {
              email: user.email,
              password: user.password,
              _id: user.id,
            },
            enteredPassword
          )
            .then((success) => {
              const { password, ...rest } = user;
              
              if (success) {
                logger.info({ message: "user login success", email: email });
                res.status(200).json({ ...rest, token: success });
              }
            })
            .catch((err) => {
              console.log(err);
              logger.error({
                message: "Unable to log User Error 401",
                email: email,
              });
              return res.status(401).json({ message: "something went wrong" });
            });
        }
      })
      .catch((error) => {
        logger.error({
          message: "Unable to log User Error 501 ",
          email: email,
        });
        return res.status(501).json({ message: "Internal server error" });
      });
  }

  async updateUser(req: Request, res: Response) {
    const { id } = req.params;
    const {name, email } = req.body;
    try {
      // Check if the user exists
      const existingUser = await prismaClient.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        logger.error({ message: "User not found", userId: id });
        return res.status(404).send({ error: "User not found" });
      }

      // Update user fields
      const { password, ...rest } = await prismaClient.user.update({
        where: { id },
        data: {
          name: name || existingUser.name,
          email: email || existingUser.email,
        },
      });

      logger.info(`User with id ${id} updated successfully`);
      return res.send(rest);
    } catch (error) {
      logger.error({ message: "Unable to log User Error 504 ", userId: id });
      console.error("Error updating user:", error);
      return res.status(504).send({ error: "Internal Server Error" });
    }
  }


  async forgotPassword(req: Request, res: Response, _next: NextFunction) {
    const { email } = req.body;
    try {
      const existingUser: any = await prismaClient.user.findUnique({
        where: { email: email },
      });
      if (!existingUser) {
        logger.error({
          message: "User with given email does not exist",
          email: email,
        });
        return res.status(402).json({ message: "User with given email does not exist" });
      }
      const jwtSecret = APP_SECRET + existingUser.password;
      const token = jwt.sign(
        { email: existingUser.email, id: existingUser.id },
        jwtSecret,
        { expiresIn: "5m" }
      );

      const link = `${process.env.API_DOMAIN}/api/user/reset-password/${existingUser.id}/${token}`;
      const templatePath = path.join(__dirname, "../views/forgot-password.ejs");
      const data = await ejs.renderFile(templatePath, { link: link });

      sendMail(data, email)
        .then((success) => {
          logger.info({
            message: "email has been sent successfully to the your email address",
            email: email,
          });
          res.status(200).json({
            message: `email has been sent successfully to ${email}`,
          });
          console.log(success);
        })
        .catch((err) => {
          logger.error({
            message: "Unable to log User Error 502 ",
            email: email,
          });
          res.status(502).json({ message: "some error occurred" });
          console.log(err);
        });
    } catch (err) {
      console.log(err);
      logger.error({ message: "Unable to log User Error 503 ", email: email });
      res.status(503).json({ message: err });
    }
  }
  async resetPassword(method: string, req: Request, res: Response, _next: NextFunction) {
    const { id, token } = req.params;
    const { password } = req.body;
    const existingUser = await prismaClient.user.findUnique({
      where: { id: id },
    });
    if (!existingUser) {
      return res.status(500).json({ message: "User does not exist" });
    }
    const jwtSecret = APP_SECRET + existingUser.password;
    try {
      const isVerified: any = jwt.verify(token, jwtSecret);
      if (isVerified) {
        if (method === "POST") {
          if (password[0] !== password[1]) {
            return res.status(403).json({ message: "Passwords dont match" });
          }
          const encryptedPassword = await bcrypt.hash(password[0], 10);
          const passwordChanged = await prismaClient.user.update({
            where: { id },
            data: { password: encryptedPassword },
          });
          if (passwordChanged) {
            res.status(200);
            res.render("reset-password-success", { link: "www.example.com" });
          } else {
            res.status(404).json({ message: "User password not updated" });
          }
        } else if (method === "GET") {
          res.render("reset-password", { email: isVerified.email });
        }
      }
    } catch (err) {
      res.status(500).json({ message: "something went wrong" });
    }
  }

  // async sendEmailOtp(req: Request, res: Response) {
  //   try {
  //     const { email } = req.body;
  //     const otp = generateOTP();
  //     const timestamp = Date.now();
  //     otps[email] = { otp, timestamp };
  //     console.log(otps);

  //     await sendOTPEmail(email, otp);
  //     res.status(200).send(`OTP sent to ${email}`);
  //   } catch (error) {
  //     res.status(500).json({ message: "Can't Proceed with the OTP" });
  //   }
  // }
  // async verifyEmailOtp(req: Request, res: Response) {
  //   try {
  //     const { email, otp, id = "" } = req.body;
  //     const currentEntry = otps[email];
  //     if (currentEntry) {
  //       const { otp: storedOtp, timestamp } = currentEntry;
  //       const currentTime = Date.now();
  //       if (currentTime - timestamp <= EMAIL_VALIDITY_DURATION) {
  //         if (storedOtp === otp) {
  //           if (id) {
  //             const updateUser = await prismaClient.user.update({
  //               where: { id },
  //               data: { isEmailVerified: true },
  //             });
  //             console.log(updateUser, "updateUser");
  //           }
  //           delete otps[email];
  //           return res.status(200).send("OTP verified successfully");
  //         } else {
  //           return res.status(400).send("Invalid OTP");
  //         }
  //       } else {
  //         delete otps[email];
  //         return res.status(400).send("OTP has expired");
  //       }
  //     } else {
  //       return res.status(400).send("No OTP found for this email");
  //     }
  //   } catch (error) {
  //     res.status(500).json({ message: "Failed to verify OTP!" });
  //   }
  // }

}

export default new UserController();
