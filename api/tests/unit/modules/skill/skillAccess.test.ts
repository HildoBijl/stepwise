import type { SkillId } from '@step-wise/skill-definition'

import { ForbiddenError } from '../../../../src/errors.ts'
import { loadVisibleSkills } from '../../../../src/modules/skill/skillAccess.ts'
import type { UserSkillRecord } from '../../../../src/modules/skill/index.ts'
import type { SkillAccessContext } from '../../../../src/modules/skill/skillAccess.ts'

function skill(skillId: string): UserSkillRecord {
	return { skillId } as UserSkillRecord
}

interface ContextOptions {
	currentUserId?: string
	isAdmin?: boolean
	withExercises?: string[]
	withoutExercises?: string[]
	skills?: UserSkillRecord[]
}

function createContext({ currentUserId = 'current-id', isAdmin = false, withExercises = [], withoutExercises = [], skills = [] }: ContextOptions = {}) {
	const loadMany = vi.fn(async (keys: { skillId: string }[]) => keys.map(({ skillId }) => skills.find(skill => skill.skillId === skillId) ?? null))
	const loadAll = vi.fn().mockResolvedValue(skills)
	const loadPermissions = vi.fn().mockResolvedValue({ withExercises, withoutExercises })
	const context = {
		userId: currentUserId,
		isAdmin,
		loaders: {
			skillForUser: { loadMany },
			allSkillsForUser: { load: loadAll },
			permittedSkillsForStudent: { load: loadPermissions },
		},
	} as unknown as SkillAccessContext
	return { context, loadAll, loadMany, loadPermissions }
}

describe('skill access', () => {
	it.each([
		['the owner', { currentUserId: 'target-id', isAdmin: false }],
		['an administrator', { currentUserId: 'admin-id', isAdmin: true }],
	] as const)('lets %s view all requested skills and their exercises', async (_label, options) => {
		const skills = [skill('one'), skill('two')]
		const { context, loadPermissions } = createContext({ ...options, skills })
		await expect(loadVisibleSkills('target-id', ['one', 'two'] as SkillId[], context)).resolves.toEqual(skills)
		expect(skills.every(item => item.mayViewExercises)).toBe(true)
		expect(loadPermissions).not.toHaveBeenCalled()
	})

	it('filters a teacher view and assigns per-skill exercise permission', async () => {
		const visibleWithExercises = skill('with')
		const visibleWithoutExercises = skill('without')
		const hidden = skill('hidden')
		const { context, loadMany } = createContext({
			withExercises: ['with'],
			withoutExercises: ['with', 'without'],
			skills: [visibleWithExercises, visibleWithoutExercises, hidden],
		})
		await expect(loadVisibleSkills('student-id', ['with', 'without', 'hidden'] as SkillId[], context)).resolves.toEqual([visibleWithExercises, visibleWithoutExercises])
		expect(loadMany).toHaveBeenCalledWith([{ userId: 'student-id', skillId: 'with' }, { userId: 'student-id', skillId: 'without' }])
		expect(visibleWithExercises.mayViewExercises).toBe(true)
		expect(visibleWithoutExercises.mayViewExercises).toBe(false)
	})

	it('loads every permitted skill ID when no IDs are requested', async () => {
		const skills = [skill('one')]
		const { context, loadMany } = createContext({ withoutExercises: ['one'], skills })
		await expect(loadVisibleSkills('student-id', undefined, context)).resolves.toEqual(skills)
		expect(loadMany).toHaveBeenCalledWith([{ userId: 'student-id', skillId: 'one' }])
	})

	it('rejects inaccessible requested skills when requested', async () => {
		const { context } = createContext({ withoutExercises: ['visible'] })
		await expect(loadVisibleSkills('student-id', ['visible', 'hidden'] as SkillId[], context, true)).rejects.toThrow(ForbiddenError)
	})

	it('propagates DataLoader errors', async () => {
		const error = new Error('load failed')
		const { context } = createContext({ currentUserId: 'target-id' })
		vi.mocked(context.loaders.skillForUser.loadMany).mockResolvedValue([error])
		await expect(loadVisibleSkills('target-id', ['one'] as SkillId[], context)).rejects.toBe(error)
	})
})
