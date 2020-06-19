const express = require('express')

/**
 * @param authStrategy :: async (req) => null | authData
 * 				Shall return `null` if the authentication wasn’t successful,
 * 				otherwise the data which the `UniversityMembership` record for
 * 				that user is supposed to be updated with.
 */
const createAuthHandler = (homepageUrl, db, authStrategy) => {
	const router = express.Router()

	router.get('/login', async (req, res) => {
		try {
			const authData = await authStrategy(req)
			if (!authData || !authData.memberId) {
				res.redirect(`${homepageUrl}?error=INVALID_AUTHENTICATION`)
				return
			}
			const membership = await db.UniversityMembership.findOne({
				where: { memberId: authData.memberId }
			})
			if (!membership) {
				res.redirect(`${homepageUrl}?error=USER_NOT_FOUND`)
				return
			}
			req.principal = {
				id: membership.userId
			}
			req.session.initiated = new Date()
		} catch(e) {
			console.log(e)
		}
		res.redirect(homepageUrl)
	})

	return router
}

module.exports = {
	createAuthHandler
}
