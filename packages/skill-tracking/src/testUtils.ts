import { type BernsteinCoefficients } from '@step-wise/bernstein-polynomials'
import { createSkillTree } from '@step-wise/skill-definition'

import type { StoredSkillLevel } from './types.ts'

export const now = new Date('2026-01-01T12:00:00.000Z')
export const twoMonthsAgo = new Date('2025-11-01T12:00:00.000Z')
export const effectivelyInfinitePracticeCount = 1_000_000

export const skillTree = createSkillTree({
	a: { name: 'A' },
	b: { name: 'B' },
})

export const coefficientsToStoredSkillLevel = (coefficients: BernsteinCoefficients, date = now, numPracticed = 0): StoredSkillLevel => ({
	coefficients,
	coefficientsOn: date,
	highest: coefficients,
	highestOn: date,
	numPracticed,
})
