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

function hash (password: string) {
  return bcrypt.hashSync(password, 10)
}

function verify (password: string, hash: string) {
  return bcrypt.compareSync(password, hash)
}
function generateToken (id: number) {
  return jwt.sign({ id }, process.env.SECRET!)
}

// get all users
app.get("/users", async (req, res) => {
  const users = await prisma.users.findMany({include:{transactions:true}});
  res.send(users);
});
//sign-up
app.post('/sign-up', async (req, res) => {
  const { username, email, password } = req.body

  try {
    const existingUser = await prisma.users.findUnique({ where: { username } })

    const errors: string[] = []

    if (typeof email !== 'string') {
      errors.push('Email missing or not correct')
    }
    if (typeof username !== 'string') {
      errors.push('Username is missing or not correct')
    }

    if (typeof password !== 'string') {
      errors.push('Password missing or not correct')
    }

    if (errors.length > 0) {
      res.status(400).send({ errors })
      return
    }

    if (existingUser) {
      res.status(400).send({ errors: ['Username already exists!'] })
      return
    }

    const user = await prisma.users.create({
      data: {username, email, password: hash(password) }
    })
    const token = generateToken(user.id)
    res.send({ user, token })
  } catch (error) {
    // @ts-ignore
    res.status(400).send({ errors: [error.message] })
  }
})
//sign-in
app.post('/sign-in', async (req, res) => {
  try {
    const username = req.body.username
    const email = req.body.email
    const password = req.body.password

    const errors: string[] = []

    if (typeof email !== 'string') {
      errors.push('Email missing or not correct')
    }
    if (typeof username !== 'string') {
      errors.push('Username is missing or not correct')
    }

    if (typeof password !== 'string') {
      errors.push('Password missing or not correct')
    }

    if (errors.length > 0) {
      res.status(400).send({ errors })
      return
    }

    const user = await prisma.users.findUnique({
      where: { username }
    })
    if (user && verify(password, user.password)) {
      const token = generateToken(user.id)
      res.send({ user, token })
    } else {
      res.status(400).send({ errors: ['Username or password invalid.'] })
    }
  } catch (error) {
    // @ts-ignore
    res.status(400).send({ errors: [error.message] })
  }
})

// get transactions

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
  });
function getCurrentUser(token: string) {
  throw new Error("Function not implemented.");
}

