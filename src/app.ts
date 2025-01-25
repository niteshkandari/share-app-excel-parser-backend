
import express from 'express';
import { Request, Response, NextFunction ,Express } from "express";
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import excelRoutes from './routes/excelRoutes';
import { errorMiddleware } from './middleware/errors';
// import HandleErrors from './utils/error-handler';

export default async (app:Express) => {

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));
  app.set("view engine", "ejs");
  app.set("views", __dirname + "/views");


  app.use("/api/ping", (req, res) => res.status(200).json({
    version: "v1",
    Api_Health:"working"
  }));
  app.use("/api/user", userRoutes);
  app.use("/api/excel", excelRoutes);
  app.use(errorMiddleware);

  // app.use((req:Request, res:Response, next:NextFunction) => {
  //   const error:Error | any = new Error("Not found");
  //   error.status = 404;
  //   next(error);
  // });
  
  // app.use(errorMiddleware);
  // app.use((error, req:Request, res:Response, next:NextFunction) => {
  //   res.status(error.status || 500);
  //   res.json({
  //     error: {
  //       message: error.message,
  //     },
  //   });
  // });

}
