/* eslint-env node */
import express from "express";
import { Account, ProgramManager, initThreadPool } from '@provable.sdk';

const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const app = express();

app.use(express.json());

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server listening at http://localhost:${process.env.PORT || 3000}`);
  });