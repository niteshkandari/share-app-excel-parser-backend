import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { APP_SECRET } from "../config";
import crypto from 'crypto'


export const GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

export const convertToPercentage = (value: number | string): string => {
  if (typeof value === 'string') {
      value = parseFloat(value); // Convert string to number if needed
  }
  
  if (isNaN(value)) {
      return "0%"; // Return "0%" if the value is not a number
  }

  return `${(value * 100).toFixed(2)}%`; // Convert to percentage with two decimal places
}

export const GeneratePassword = async (password: string, salt: string) => {
  return await bcrypt.hash(password, salt);
};

export const ValidatePassword = async (
   {
    email:savedEmail,
    password:savedPassword,
    _id
   },
  enteredPassword: string,
) => {
  return new Promise<string | Error>((resolve, reject) => {
  bcrypt.compare(enteredPassword, savedPassword, (err, result) => {
      if(err) return reject(err);
      if(result) {
        const token = GenerateSignature({
          email:savedEmail,
          _id
        })
        resolve(token);
      }
      reject(err);
    })
  })
};

export const GenerateSignature = async (payload) => {
  return jwt.sign(payload, APP_SECRET, { expiresIn: "6h" });
};

export const ValidateSignature = async (req) => {
// try{
//   const token = req.headers.authorization.split(' ')[1];
//   const decoded = jwt.verify(token,process.env.JWT_KEY);
//   req.userData = decoded;
//   next();
// }catch (error) {
//   return res.status(401).json({
//       message:'Auth failed, token not valid'
//   })
// }
const signature = req.get("Authorization");
if (signature) {
    try {
    const payload = jwt.verify(signature.split(" ")[1], APP_SECRET);
    req.user = payload;
    return true;
    } catch(err) {
      // console.log({err:err});
      return false;
    }
  }
  return false;
};

export const FormateData = (data: unknown) => {
  if (data) {
    return { data };
  } else {
    throw new Error("Data Not found!");
  }
};

/**
 * Generates a random password of a for user when logging with google auth.
 * @param {number} length - The length of the generated password.
 * @param {string} charset - The set of characters to use for the password.
 * @returns {string} - The generated password.
 */

export const GenerateNewPassword = (length = 12, charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=') => {

  const randomBytes = crypto.randomBytes(length);
  const characters = charset.length;

  const password = Array.from(randomBytes)
    .map((byte) => charset[byte % characters])
    .join("");

  return password;
};