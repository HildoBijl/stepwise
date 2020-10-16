const { AuthStrategyTemplate } = require('../authHandler')

class AuthStrategy extends AuthStrategyTemplate {
	constructor(database, surfConextClient) {
		super()
		this._db = database
		this._surfConextClient = surfConextClient
	}

	async initiate(sessionId) {
		return await this._surfConextClient
			.authorizationUrl(sessionId)
	}

	async authenticateAndSync(req) {
		const surfRawData = await this._surfConextClient
			.getData(req.query, req.session.id)
		if (!surfRawData) {
			return null
		}
		const surfProfile = await this._db.SurfConextProfile.findOne({
			where: { id: surfRawData.sub },
			include: {
				model: this._db.User,
			},
		})
		return await this._db.transaction(async t => {
			const [user] = await this._db.User.upsert({
				// Update if user exists, otherwise a new one gets created
				id: surfProfile ? surfProfile.user.id : undefined,
				name: surfRawData.name || undefined,
				givenName: surfRawData.given_name || undefined,
				familyName: surfRawData.family_name || undefined,
				email: surfRawData.email || undefined,
				role: getRole(surfRawData),
			}, { returning: true, transaction: t })
			await this._db.SurfConextProfile.upsert({
				id: surfRawData.sub,
				userId: user.id,
				schacHomeOrganization: surfRawData.schac_home_organization,
				schacPersonalUniqueCode: surfRawData.schac_personal_unique_code,
				locale: surfRawData.locale,
			}, { transaction: t })
			return user
		})
	}
}

function getRole(surfRawData) {
	const affiliation = surfRawData.eduperson_affiliation
	if (affiliation.includes('teacher')) return 'teacher'
	return undefined // use default
}

module.exports = {
	AuthStrategy
}
