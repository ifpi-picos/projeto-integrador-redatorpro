import Express from 'express'
import logger from './middlewares/logger.js'
import userRouter from './router/users.js'

const app = Express()
app.use(Express.json())

app.use(logger)

app.get('/', (req, res) => {
    res.send('Hello World!')
})


app.use(userRouter)


app.listen(3000, () => {
    console.log('app online na porta 3000')
});