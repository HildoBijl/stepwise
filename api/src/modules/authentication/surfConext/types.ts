import type { Transaction } from 'sequelize'

import type { UserModel } from '../../user/model.ts'

import type { SurfConextProfileModel } from '../model.ts'

export interface SurfConextAuthDatabase {
	User: UserModel
	SurfConextProfile: SurfConextProfileModel
	transaction<T>(procedure: (transaction: Transaction) => PromiseLike<T>): Promise<T>
}

export interface SurfConextCallbackParams {
	state?: unknown
	code?: unknown
	sub?: unknown
}

export interface SurfConextIdentity {
	sub: string
	databaseId?: string | null
	name?: string | null
	given_name?: string | null
	family_name?: string | null
	email?: string | null
	schac_home_organization?: string | null
	schac_personal_unique_code?: string[] | null
	locale?: string | null
	eduperson_affiliation?: string[] | null
	[claim: string]: unknown
}

export interface SurfConextClient {
	authorizationUrl(sessionId: string): Promise<string | null>
	getData(
		params: SurfConextCallbackParams,
		sessionId: string,
	): Promise<SurfConextIdentity | null>
}
