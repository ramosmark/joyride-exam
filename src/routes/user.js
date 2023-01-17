import express from 'express'
import auth from '../middlewares/auth.js'
import { compare } from '../helpers/compare.js'
import { register, login, logout, getGithubInfo } from '../controllers/user.js'
import CONSTANTS from '../lib/constants.js'

const router = new express.Router()

//register user
router.post('/users/register', async (req, res) => {
	try {
		const result = await register(req.body)
		res.status(201).send(result)
	} catch (err) {
		res.status(400).send(err)
	}
})

//login user
router.post('/users/login', async (req, res) => {
	try {
		const result = await login(req.body)
		res.send(result)
	} catch (err) {
		res.status(401).send(err)
	}
})

//logout
router.post('/users/logout', auth, async (req, res) => {
	try {
		const result = await logout(req.header('Authorization'))
		res.send(result)
	} catch (err) {
		res.status(500).send(err)
	}
})


//get github info
router.post('/users/info', auth, async (req, res) => {
	const users = req.body
	const results = []

	if (!users.length) {
		return res.status(400).send({
			'success': false,
			'message': CONSTANTS.PROVIDE_USERNAME
		})
	}

	for (const user of users) {
		const data = await getGithubInfo(user.username)
		results.push(data)
	}
	
	results.sort(compare)
	res.send(results)
})

export default router
