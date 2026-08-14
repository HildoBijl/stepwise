import type { SurfConextCallbackParams, SurfConextClient, SurfConextIdentity } from './types.js'

interface UserRecord {
	id: string
}

interface SurfConextProfileRecord {
	user: UserRecord
}

interface FindOptions {
	where: Record<string, unknown>
	include?: { model: unknown }
}

interface WriteOptions {
	returning?: boolean
	transaction: unknown
}

interface ApiDatabase {
	User: {
		findOne(options: FindOptions): Promise<UserRecord | null>
		upsert(values: Record<string, unknown>, options: WriteOptions): Promise<[UserRecord, unknown?]>
	}
	SurfConextProfile: {
		findOne(options: FindOptions): Promise<SurfConextProfileRecord | null>
		upsert(values: Record<string, unknown>, options: WriteOptions): Promise<unknown>
	}
	transaction<T>(callback: (transaction: unknown) => Promise<T>): Promise<T>
}

interface AuthenticationRequest {
	query: SurfConextCallbackParams
	session: { id: string }
}

export class AuthStrategy {
	constructor(private readonly _db: ApiDatabase, private readonly _surfConextClient: SurfConextClient) { }

	async initiate(sessionId: string): Promise<string | null> {
		return this._surfConextClient.authorizationUrl(sessionId)
	}

	async authenticateAndSync(req: AuthenticationRequest): Promise<UserRecord | null> {
		const surfRawData = await this._surfConextClient.getData(req.query, req.session.id)
		if (!surfRawData?.email) return null

		const surfProfile = await this._db.SurfConextProfile.findOne({ where: { id: surfRawData.sub }, include: { model: this._db.User } })
		let userId = surfProfile?.user.id

		if (!userId) {
			const userWithoutSurfProfile = await this._db.User.findOne({ where: { email: surfRawData.email } })
			userId = userWithoutSurfProfile?.id
		}

		return this._db.transaction(async transaction => {
			const [user] = await this._db.User.upsert({
				id: userId || surfRawData.databaseId || undefined,
				name: surfRawData.name || undefined,
				givenName: surfRawData.given_name || undefined,
				familyName: surfRawData.family_name || undefined,
				email: surfRawData.email,
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
