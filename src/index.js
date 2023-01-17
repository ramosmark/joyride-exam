import express from 'express'
import './db/db.js'
import userRouter from './routes/user.js'

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)

app.listen(port, () => {
	console.log(`App is running on port ${port}`)
})
