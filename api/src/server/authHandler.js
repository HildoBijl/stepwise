const express = require('express')

/**
 * @param authStrategy :: async (req) => null | authData
 * 				Shall return `null` if the authentication wasn’t successful,
 * 				otherwise the data which the `UniversityMembership` record for
 * 				that user is supposed to be updated with.
 */
const createAuthHandler = (db, authStrategy) => {
	const router = express.Router()

	router.get('/login', async (req, res) => {
		try {
			const authData = await authStrategy(req)
			if (!authData || !authData.memberId) {
				res.status(403)
				res.send("INVALID_AUTHENTICATION")
				return
			}
			const membership = await db.UniversityMembership.findOne({
				where: { memberId: authData.memberId }
			})
			if (!membership) {
				res.status(403)
				res.send("USER_NOT_FOUND")
				return
			}
			req.principal = {
				id: membership.userId
			}
			req.session.initiated = new Date()
			res.send("OK")
		} catch(e) {
			console.log(e)
			res.send("ERROR")
		}
	})

	return router
}

module.exports = {
	createAuthHandler
}
