import type { UserRecord } from '../../user/models.ts'

import type { SurfConextAuthDatabase, SurfConextCallbackParams, SurfConextClient, SurfConextIdentity, SurfConextIdentityProvider } from './types.ts'

interface AuthenticationRequest {
	query: SurfConextCallbackParams
	session: { id: string }
}

export class AuthStrategy {
	constructor(private readonly _db: SurfConextAuthDatabase, private readonly _surfConextClient: SurfConextClient) { }

	async initiate(sessionId: string, identityProvider?: SurfConextIdentityProvider): Promise<string | null> {
		return this._surfConextClient.authorizationUrl(sessionId, identityProvider)
	}

	async authenticateAndSync(req: AuthenticationRequest): Promise<UserRecord | null> {
		const surfRawData = await this._surfConextClient.getIdentity(req.query, req.session.id)
		if (!surfRawData?.email) return null
		const email = surfRawData.email

		const surfProfile = await this._db.SurfConextProfile.findOne({ where: { id: surfRawData.sub }, include: { model: this._db.User } })
		let existingUser: UserRecord | null | undefined = surfProfile?.user
		if (!existingUser) existingUser = await this._db.User.findOne({ where: { email } })
		const userId = existingUser?.id

		return this._db.transaction(async transaction => {
			// SurfConext determines student/teacher access on every login. Administrators are assigned locally and retain that role.
			const role = existingUser?.role === 'admin' ? 'admin' : getRole(surfRawData)
			const [user] = await this._db.User.upsert({
				...(userId || surfRawData.databaseId ? { id: userId || surfRawData.databaseId! } : {}),
				...(surfRawData.name != null ? { name: surfRawData.name } : {}),
				...(surfRawData.given_name != null ? { givenName: surfRawData.given_name } : {}),
				...(surfRawData.family_name != null ? { familyName: surfRawData.family_name } : {}),
				email,
				role,
			}, { returning: true, transaction })
			await this._db.SurfConextProfile.upsert({
				id: surfRawData.sub,
				userId: user.id,
				schacHomeOrganization: surfRawData.schac_home_organization ?? null,
				schacPersonalUniqueCode: surfRawData.schac_personal_unique_code ?? null,
				locale: surfRawData.locale ?? null,
			}, { transaction })
			return user
		})
	}
}

function getRole(surfRawData: SurfConextIdentity): 'student' | 'teacher' {
	const affiliation = surfRawData.eduperson_affiliation
	return Array.isArray(affiliation) && affiliation.includes('teacher') ? 'teacher' : 'student'
}
