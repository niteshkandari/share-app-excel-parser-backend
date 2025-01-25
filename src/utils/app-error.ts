import { STATUS_CODES } from "./status-code.enum";

class AppError extends Error {
  constructor(
    public name: string,
    public statusCode: number,
    public description: string,
    public isOperational: boolean,
    public errorStack?: boolean,
    public logingErrorResponse?: string
  ) {
    super(description);
    Object.setPrototypeOf(this,new.target.prototype);
    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorStack = errorStack;
    this.logingErrorResponse = logingErrorResponse;
    Error.captureStackTrace(this);
  }
}

//api specific errors
class ApiError extends AppError {
  constructor(
    name: string,
    statusCode = STATUS_CODES.INTERNAL_ERROR,
    description = "Internal Server Error",
    isOperational = true
  ) {
    super(name, statusCode, description, isOperational);
  }
}

class BadRequestError extends AppError {
  constructor(description = 'Bad request',logingErrorResponse){
      super('NOT FOUND', STATUS_CODES.BAD_REQUEST,description,true, false, logingErrorResponse);
  }
}

export { AppError, ApiError, BadRequestError }; 
