import { NextFunction, Request, Response } from "express";
import { HttpException } from "../exceptions/root";

export const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
  // Set default values to prevent runtime errors
  console.log("----------------------------------------------------------------")
  
  console.log("called----------------------------------------------------------------" , error)
  
  console.log("----------------------------------------------------------------")
  const statusCode = error.statusCode || 500; // Default to 500 if statusCode is undefined
  const message = error.message || "An unexpected error occurred.";
  const errorCode = error.errorCode || "UNKNOWN_ERROR"; // Default error code
  const errors = error.errors || []; // Default to an empty array if no errors are provided

  console.error(`Error: ${message}`, { errorCode, errors }); // Log the error for debugging

  // Send the error response
  res.status(statusCode).json({
    message,
    errorCode,
    errors,
  });
};
