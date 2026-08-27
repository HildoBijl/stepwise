import { currentPrivacyPolicyVersion, languages } from '@step-wise/settings'

import { InvalidInputError } from '../../../../src/errors.ts'
import { createUserResolvers } from '../../../../src/modules/user/resolvers.ts'
import type { UserContext, UserRecord } from '../../../../src/modules/user/index.ts'

function createUser(overrides: Partial<UserRecord> = {}): UserRecord {
	return {
		id: 'target-id',
		email: 'target@example.org',
		privacyPolicyAcceptedVersion: null,
		privacyPolicyAcceptedAt: null,
		update: vi.fn(async function (this: UserRecord, values: Partial<UserRecord>) { Object.assign(this, values); return this }),
		destroy: vi.fn().mockResolvedValue(undefined),
		...overrides,
	} as unknown as UserRecord
}

function createContext(user: UserRecord | null, isAdmin = false): UserContext {
	return {
		user,
		isAdmin,
		ensureLoggedIn: vi.fn(),
		ensureAdmin: vi.fn(),
		db: {} as UserContext['db'],
		loaders: {} as UserContext['loaders'],
	}
}

describe('user resolvers', () => {
	it('resolves public, private, own, and administrator views', async () => {
		const target = createUser()
		const current = createUser({ id: 'current-id' })
		const rule = vi.fn().mockResolvedValue(true)
		const resolveType = createUserResolvers([rule]).User.__resolveType

		await expect(resolveType(target, createContext(null))).resolves.toBe('UserPublic')
		await expect(resolveType(target, createContext(target))).resolves.toBe('UserFull')
		await expect(resolveType(target, createContext(current, true))).resolves.toBe('UserFull')
		await expect(resolveType(target, createContext(current))).resolves.toBe('UserPrivate')
		expect(rule).toHaveBeenCalledWith(target, expect.objectContaining({ user: current }))
	})

	it('evaluates private-access rules in order and stops after the first match', async () => {
		const target = createUser()
		const context = createContext(createUser({ id: 'current-id' }))
		const first = vi.fn().mockReturnValue(false)
		const second = vi.fn().mockResolvedValue(true)
		const third = vi.fn().mockReturnValue(true)
		await expect(createUserResolvers([first, second, third]).User.__resolveType(target, context)).resolves.toBe('UserPrivate')
		expect(first).toHaveBeenCalledOnce()
		expect(second).toHaveBeenCalledOnce()
		expect(third).not.toHaveBeenCalled()
	})

	it('returns a public view when no access rule matches', async () => {
		const target = createUser()
		const context = createContext(createUser({ id: 'current-id' }))
		await expect(createUserResolvers([() => false]).User.__resolveType(target, context)).resolves.toBe('UserPublic')
	})

	it('reports privacy-policy consent', () => {
		const acceptedAt = new Date()
		const user = createUser({ privacyPolicyAcceptedVersion: currentPrivacyPolicyVersion, privacyPolicyAcceptedAt: acceptedAt })
		expect(createUserResolvers().UserFull.privacyPolicyConsent(user)).toEqual({ version: currentPrivacyPolicyVersion, acceptedAt, isLatestVersion: true })
	})

	it('sets a supported language and rejects unsupported languages', async () => {
		const user = createUser()
		const context = createContext(user)
		const mutation = createUserResolvers().Mutation.setLanguage
		await expect(mutation(undefined, { language: languages[0] }, context)).resolves.toBe(user)
		expect(user.update).toHaveBeenCalledWith({ language: languages[0] })
		await expect(mutation(undefined, { language: 'unsupported' }, context)).rejects.toThrow('unsupported')
	})

	it('accepts the latest privacy policy only when needed', async () => {
		const user = createUser()
		const mutation = createUserResolvers().Mutation.acceptLatestPrivacyPolicy
		const result = await mutation(undefined, undefined, createContext(user))
		expect(user.update).toHaveBeenCalledWith(expect.objectContaining({ privacyPolicyAcceptedVersion: currentPrivacyPolicyVersion, privacyPolicyAcceptedAt: expect.any(Date) }))
		expect(result).toMatchObject({ version: currentPrivacyPolicyVersion, isLatestVersion: true })

		vi.mocked(user.update).mockClear()
		await mutation(undefined, undefined, createContext(user))
		expect(user.update).not.toHaveBeenCalled()
	})

	it('deletes an account only after email confirmation', async () => {
		const user = createUser()
		const mutation = createUserResolvers().Mutation.deleteAccount
		await expect(mutation(undefined, { confirmEmail: 'wrong@example.org' }, createContext(user))).rejects.toThrow(InvalidInputError)
		expect(user.destroy).not.toHaveBeenCalled()
		await expect(mutation(undefined, { confirmEmail: user.email! }, createContext(user))).resolves.toBe(user.id)
		expect(user.destroy).toHaveBeenCalledOnce()
	})
})
