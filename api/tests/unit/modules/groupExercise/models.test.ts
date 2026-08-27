import type { GroupWithMembers } from '../../../../src/modules/group/index.ts'
import { hasLoadedGroupExerciseActions, hasLoadedGroupExerciseEvents, hasLoadedGroupExercises } from '../../../../src/modules/groupExercise/models.ts'
import type { GroupExerciseEventRecord, GroupExerciseSampleRecord } from '../../../../src/modules/groupExercise/index.ts'

describe('group-exercise model guards', () => {
	it('detects loaded actions', () => {
		expect(hasLoadedGroupExerciseActions({ actions: [] } as unknown as GroupExerciseEventRecord)).toBe(true)
		expect(hasLoadedGroupExerciseActions({} as GroupExerciseEventRecord)).toBe(false)
	})

	it('requires events and all nested actions to be loaded', () => {
		expect(hasLoadedGroupExerciseEvents({ events: [] } as unknown as GroupExerciseSampleRecord)).toBe(true)
		expect(hasLoadedGroupExerciseEvents({ events: [{ actions: [] }] } as unknown as GroupExerciseSampleRecord)).toBe(true)
		expect(hasLoadedGroupExerciseEvents({ events: [{}] } as unknown as GroupExerciseSampleRecord)).toBe(false)
		expect(hasLoadedGroupExerciseEvents({} as GroupExerciseSampleRecord)).toBe(false)
	})

	it('requires exercises and all nested associations to be loaded', () => {
		expect(hasLoadedGroupExercises({ exercises: [] } as unknown as GroupWithMembers)).toBe(true)
		expect(hasLoadedGroupExercises({ exercises: [{ events: [{ actions: [] }] }] } as unknown as GroupWithMembers)).toBe(true)
		expect(hasLoadedGroupExercises({ exercises: [{ events: [{}] }] } as unknown as GroupWithMembers)).toBe(false)
		expect(hasLoadedGroupExercises({} as GroupWithMembers)).toBe(false)
	})
})
