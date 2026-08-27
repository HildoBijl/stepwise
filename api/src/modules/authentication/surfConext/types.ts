import type { Transaction } from 'sequelize'

import { isPlainObject } from '@step-wise/js-utils'

import type { UserModel } from '../../user/models.ts'

import type { SurfConextProfileModel } from '../models.ts'

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

const nullableStringClaims = [
	'databaseId',
	'name',
	'given_name',
	'family_name',
	'email',
	'schac_home_organization',
	'locale',
] as const

const nullableStringArrayClaims = ['schac_personal_unique_code', 'eduperson_affiliation'] as const

export function isSurfConextIdentity(value: unknown): value is SurfConextIdentity {
	if (!isPlainObject(value) || typeof value.sub !== 'string') return false
	if (nullableStringClaims.some(claim => value[claim] !== undefined && value[claim] !== null && typeof value[claim] !== 'string')) return false
	return nullableStringArrayClaims.every(claim => {
		const claimValue = value[claim]
		return claimValue === undefined || claimValue === null || (Array.isArray(claimValue) && claimValue.every(entry => typeof entry === 'string'))
	})
}

export function ensureSurfConextIdentities(value: unknown): asserts value is SurfConextIdentity[] {
	if (!Array.isArray(value) || !value.every(isSurfConextIdentity)) throw new TypeError('Expected an array of valid SurfConext identities.')
}

export interface SurfConextClient {
	authorizationUrl(sessionId: string): Promise<string | null>
	getIdentity(
		params: SurfConextCallbackParams,
		sessionId: string,
	): Promise<SurfConextIdentity | null>
}
