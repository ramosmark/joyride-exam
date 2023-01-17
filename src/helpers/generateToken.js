import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export function generateToken(id) {
    const token = jwt.sign({id}, process.env.SECRET)
    return token
}


