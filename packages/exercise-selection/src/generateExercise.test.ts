import type { Exercise } from '@step-wise/exercise-definition'

import { generateRandomExerciseInstance } from './generateExercise'

describe('generateRandomExerciseInstance', () => {
	test('generates and stores the initial state from the generated parameters', () => {
		const parameters = { questionCount: 3 }
		const initialState = { questionsRemaining: 3 }
		const exercise: Exercise = {
			metaData: {},
			generateParameters: () => parameters,
			getInitialState: receivedParameters => receivedParameters === parameters ? initialState : {},
			processSoloAction: ({ state }) => state,
		}

		expect(generateRandomExerciseInstance({ sample: exercise }, 'solo')).toEqual({
			exerciseId: 'sample',
			mode: 'solo',
			parameters,
			initialState,
			history: [],
		})
	})
})
