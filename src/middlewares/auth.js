import jwt from 'jsonwebtoken'
import pool from '../db/db.js'
import dotenv from 'dotenv'
dotenv.config()

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.SECRET)
        const [ userToken ] = await pool.query(`
            SELECT * FROM auth_tokens
            WHERE token = (?) AND user_id = (?)
        `, [token, decoded.id])

        //try to make into a single query USE JOIN
        const [ user ] = await pool.query(`
            SELECT * FROM users
            WHERE id = (?)
        `, [userToken[0].user_id])

        if (!user[0]) {
            throw new Error()
        }

        req.user = user[0]
        next()

    } catch (e) {
        res.status(401).send({ 
            success: false, 
            message: 'Authentication needed' 
        })
    }
}

export default auth