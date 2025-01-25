import express ,  {Request, Response}  from 'express';
import expressApp from "./app";
import { PORT } from "./config";
import prisma from "./prismaClient";


const app = express();
//const handle = app.getRequestHandler();

const startServer = async () => {
  await prisma.$connect();
  await expressApp(app);    
  app.listen(PORT, () => {
    console.log("Db connection established");
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


  //<Krafted by Nitesh>