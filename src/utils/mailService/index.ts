import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import prismaClient from "../../prismaClient";

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});
export const sendMail = (htmlTemplate: any, recipient: string) => {

  const mailOptions = {
    from: process.env.EMAIL,
    to: recipient,
    subject: "password reset",
    html: htmlTemplate,
  };
  return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(error);  
        } else {
          resolve("Email sent: " + info.response);
        //   console.log("Email sent: " + info.response);
        }
      });
  })
};

export const sendOTPEmail = async (email: string,  otp: string) => {
  const templatePath = path.join(__dirname, '../../views/otp-email.ejs');
  const imagePath = path.join(__dirname, '../../images/brooker.png');
  const htmlTemplate = await ejs.renderFile(templatePath, {  otp, imagePath });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Your OTP Verification Code',
    html: htmlTemplate,
  };
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        reject(error)
      } else {
        console.log('Email sent:', info.response);
        resolve(info.response)
      }
    });
  })

};

export const sendInquery = async (body: {
  fullName: string,
  phoneNumber: string,
  email: string,
  message: string,
  ownerEmail:string
}) => {
  const { fullName,
    phoneNumber,
    email,
    message, ownerEmail } = body;
  const templatePath = path.join(__dirname, '../../views/contact-email.ejs');
  const imagePath = path.join(__dirname, '../../images/brooker.png');
  const htmlTemplate = await ejs.renderFile(templatePath, {
    fullName,
    phoneNumber,
    email,
    message, imagePath });

  const mailOptions = {
    from: process.env.EMAIL,
    to: ownerEmail,
    subject: 'New inquery Update',
    html: htmlTemplate,
  };
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        reject(error)
      } else {
        console.log('Email sent:', info.response);
        resolve(info.response)
      }
    });
  })

};

export const sendContactFormInquery = async (body: {
  name: string,
  phone: string,
  email: string,
  message: string,
  propertyType:string,
}) => {
  const { name,
    phone,
    email,
    message, propertyType } = body;
  const templatePath = path.join(__dirname, '../../views/contact-form.ejs');
  const htmlTemplate = await ejs.renderFile(templatePath, {
    fullName:name,
    email,
    phoneNumber:phone,
    message, propertyType
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: "",
    subject: '',
    html: htmlTemplate,
  };
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        reject(error)
      } else {
        console.log('Email sent:', info.response);
        resolve(info.response)
      }
    });
  })

};