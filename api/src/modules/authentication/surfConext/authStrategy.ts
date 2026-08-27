import type { SurfConextAuthDatabase, SurfConextCallbackParams, SurfConextClient, SurfConextIdentity } from './types.ts'

interface AuthenticationRequest {
	query: SurfConextCallbackParams
	session: { id: string }
}

export class AuthStrategy {
	constructor(private readonly _db: SurfConextAuthDatabase, private readonly _surfConextClient: SurfConextClient) { }

	async initiate(sessionId: string): Promise<string | null> {
		return this._surfConextClient.authorizationUrl(sessionId)
	}

	async authenticateAndSync(req: AuthenticationRequest) {
		const surfRawData = await this._surfConextClient.getData(req.query, req.session.id)
		if (!surfRawData?.email) return null
		const email = surfRawData.email

		const surfProfile = await this._db.SurfConextProfile.findOne({ where: { id: surfRawData.sub }, include: { model: this._db.User } })
		let userId = surfProfile?.user?.id

		if (!userId) {
			const userWithoutSurfProfile = await this._db.User.findOne({ where: { email } })
			userId = userWithoutSurfProfile?.id
		}

		return this._db.transaction(async transaction => {
			const [user] = await this._db.User.upsert({
				id: userId || surfRawData.databaseId || undefined,
				name: surfRawData.name || undefined,
				givenName: surfRawData.given_name || undefined,
				familyName: surfRawData.family_name || undefined,
				email,
				role: getRole(surfRawData),
			}, { returning: true, transaction })
			await this._db.SurfConextProfile.upsert({
				id: surfRawData.sub,
				userId: user.id,
				schacHomeOrganization: surfRawData.schac_home_organization,
				schacPersonalUniqueCode: surfRawData.schac_personal_unique_code,
				locale: surfRawData.locale,
			}, { transaction })
			return user
		})
	}
}

function getRole(surfRawData: SurfConextIdentity): 'teacher' | undefined {
	const affiliation = surfRawData.eduperson_affiliation
	return Array.isArray(affiliation) && affiliation.includes('teacher') ? 'teacher' : undefined
}
