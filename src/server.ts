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


function getToken (id: number) {
  return jwt.sign({ id: id }, SECRET, {
    expiresIn: '2 days'
  })
}

async function getCurrentUser (token: string) {
  const decodedData = jwt.verify(token, SECRET)
  const user = await prisma.users.findUnique({
    // @ts-ignore
    where: { id: decodedData.id },
    include: { transactions: true }
  })
  return user
}

app.get("/users", async (req, res) => {
  const users = await prisma.users.findMany({include:{transactions:true}});
  res.send(users);
});

app.post('/sign-up', async (req, res) => {
  try {
    const match = await prisma.users.findUnique({
      where: { username: req.body.username }
    })

    if (match) {
      res.status(400).send({ error: 'This account already exists.' })
    } else {
      const user = await prisma.users.create({
        data: {
          username:req.body.username,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password)
        },
        include: { transactions: true }
      })

      res.send({ user: user, token: getToken(user.id) })
    }
  } catch (error) {
    // @ts-ignore
    res.status(400).send({ error: error.message })
  }
})

app.post('/sign-in', async (req, res) => {
  const user = await prisma.users.findUnique({
    where: { username: req.body.username },
    include: { transactions: true }
  })
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    res.send({ user: user, token: getToken(user.id) })
  } else {
    res.status(400).send({ error: 'Invalid username or password!' })
  }
})

app.get('/validate', async (req, res) => {
  try {
    if (req.headers.authorization) {
      const user = await getCurrentUser(req.headers.authorization)
      // @ts-ignore
      res.send({ user, token: getToken(user.id) })
    }
  } catch (error) {
    // @ts-ignore
    res.status(400).send({ error: error.message })
  }
})

app.get('/transactions', async (req, res) => {
  try {
    // @ts-ignore
    const user = await getCurrentUser(req.headers.authorization)
    // @ts-ignore
    res.send(user?.transactions)
  } catch (error) {
    // @ts-ignore
    res.status(400).send({ error: error.message })
  }
})

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
  });


