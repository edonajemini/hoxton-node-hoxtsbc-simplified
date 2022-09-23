import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import env from "dotenv";
import { PrismaClient } from "@prisma/client";

env.config();
const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

const port = 4000;
const SECRET = process.env.SECRET!;

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
  });