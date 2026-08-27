import { hasLoadedExerciseEvents } from '../../../../src/modules/exercise/models.ts'
import type { ExerciseSampleRecord } from '../../../../src/modules/exercise/index.ts'

describe('exercise model guards', () => {
	it.each([
		[[], true],
		[[{}], true],
		[undefined, false],
	])('detects whether exercise events are loaded', (events, expected) => {
		const exercise = { events } as unknown as ExerciseSampleRecord
		expect(hasLoadedExerciseEvents(exercise)).toBe(expected)
	})
})
