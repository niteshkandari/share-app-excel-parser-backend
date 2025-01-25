import dotEnv from "dotenv";

declare const process : {
  env: {
    NODE_ENV: string,
    PORT: string,
    DATABASE_URL: string,
    APP_SECRET: string,
  }
}

if (process.env.NODE_ENV !== "prod") {
  dotEnv.config({ override: true, path: ".env" });
} else {
  dotEnv.config({ override: true, path: ".env.prod" });
}

const { PORT, DATABASE_URL, APP_SECRET } = process.env;

export { PORT, DATABASE_URL, APP_SECRET };
