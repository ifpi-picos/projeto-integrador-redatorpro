import { PrismaClient } from '@prisma/client'
import {Router} from 'express';

const userRouter = Router();
const prisma = new PrismaClient()

userRouter.get('/users', async (req, res) => {
    const users = await prisma.user.findMany({});
    res.json(users)
    })

userRouter.post('/users', async (req, res) => {
    const user = req.body
    const userSaved = await prisma.user.create(
        {
            data: user
        }
       )
        res.send(userSaved)
  })

export default userRouter;