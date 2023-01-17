import { v4 as uuidv4 } from 'uuid'
import validator from 'validator'
import bcrypt from 'bcrypt'
import axios from 'axios'
import { createClient } from 'redis'
import dotenv from 'dotenv'
import pool from '../db/db.js'
import { generateToken } from '../helpers/generateToken.js'
import CONSTANTS from '../lib/constants.js'

dotenv.config()
const redisClient = createClient()
await redisClient.connect()

const isEmailExisting = async (email) => {
    const result = await pool.query(`
        SELECT * FROM users
        WHERE email = (?)
    `, [email])

    return result[0].length !== 0
}

export const register = (user) => {
    const { name, email, password } = user

    return new Promise(async (resolve, reject) => {
        if (!name) {
            return reject({
                'success': false,
                'message': CONSTANTS.NAME_ERROR_MESSAGE
            })
        }

        if (await isEmailExisting(email)) {
            return reject({
                'success': false,
                'message': CONSTANTS.EMAIL_EXISTS
            })
        }
    
        if (!validator.isEmail(email)) {
            return reject({
                'success': false,
                'message': CONSTANTS.INVALID_EMAIL
            })
        }
    
        if (!validator.isStrongPassword(password)) {
            return reject({
                'success': false,
                'message': CONSTANTS.WEAK_PASSWORD
            })
        }
    
        const [ result ] = await pool.query(`
            INSERT INTO users(id, name, email, password)
            VALUES (?, ?, ?, ?)
            `, [uuidv4(), name, email, await bcrypt.hash(password, 8)]
        )
    
        if (result.affectedRows) {
            resolve({
                'success': true,
                'message': CONSTANTS.REGISTRATION_SUCCESS
            })
        }
    })
}

export const login = (credentials) => {
    const { email, password } = credentials
    return new Promise(async (resolve, reject) => {
        const [user] = await pool.query(`
            SELECT * FROM users
            WHERE email = (?)
        `, [email])

        if (user.length === 0) {
            return reject({
                'success': false,
                'message': CONSTANTS.INVALID_EMAIL
            })
        }

        const isMatch = await bcrypt.compare(password, user[0].password)

        if (isMatch) {
            const token = generateToken(user[0].id)

            await pool.query(`
                INSERT INTO auth_tokens(token, user_id)
                VALUES (?, ?)
            `, [token, user[0].id])

            return resolve({
                'success': true,
                user: {
                    id: user[0].id,
                    name: user[0].name,
                },
                token
            })
        }

        return reject({
            'success': false,
            'message': CONSTANTS.INCORRECT_PASSWORD
        })
    })
}

export const logout = async (bearerToken) => {
    const token = bearerToken.replace('Bearer ', '')

    return new Promise(async (resolve, reject) => {
        const [ result ] = await pool.query(`
        DELETE FROM auth_tokens
        WHERE token = (?)
        `, [token])

        console.log(result)

        if (result.affectedRows) {
            return resolve ({
                'success': true,
                'message': CONSTANTS.LOGOUT_SUCCESS
            })
        }

        return reject({
            'success': false,
            'message': CONSTANTS.LOGOUT_FAILED
        })
    })
}

export const getGithubInfo = (username) => {
    return new Promise (async (resolve, reject) => {
        const cachedData = await redisClient.get(`user_details?${username}`)
        
        if (cachedData) {
            return resolve(JSON.parse(cachedData))
        } else {
            const data = await axios.get(`https://api.github.com/users/${username}`)
            .then((response) => {
                return response.data
            }).catch(e => {
                return (e)
            })

            if (data.code === CONSTANTS.ERR_BAD_REQUEST) {
                return resolve({
                    'success': false,
                    'username': username,
                    'message': CONSTANTS.USERNAME_NOT_EXIST
                })
            }   

            const userData = {
                name: data.name,
                login: data.login,
                company: data.company,
                followers: data.followers,
                public_repos: data.public_repos,
                average_followers_per_repo: data.followers / data.public_repos
            }

            redisClient.setEx(`user_details?${username}`, process.env.EXPIRATION,  JSON.stringify(userData))
            return resolve(userData)
        }
    })
}