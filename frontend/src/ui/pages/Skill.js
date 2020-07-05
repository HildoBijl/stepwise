import React, { useEffect, useCallback } from 'react'
import { useRouteMatch, Link } from 'react-router-dom'

import skills from 'step-wise/edu/skills'
import ExerciseContainer from '../components/ExerciseContainer'
import { usePaths } from '../routing'
import { useUserResults } from '../user'
import { useSkillQuery, useStartExerciseMutation, useSubmitExerciseActionMutation } from '../api/skill'
import Loading from '../components/Loading'
import Error from '../components/Error'

export default function Skill() {
	const { loading, data } = useUserResults()
	const paths = usePaths() // ToDo: remove later, once not needed.

	if (loading)
		return <Loading text="Loading user data." />

	const user = data.me
	return <>
		<p>Some possible skills to practice: <Link to={paths.skill({ skillId: 'fillIn' })}>Fill in a number</Link> - <Link to={paths.skill({ skillId: 'summation' })}>Summation</Link> - <Link to={paths.skill({ skillId: 'multiplication' })}>Multiplication</Link> - <Link to={paths.skill({ skillId: 'summationOfMultiplications' })}>Summation of multiplications</Link> - <Link to={paths.skill({ skillId: 'example' })}>Linear equation</Link>.</p>
		{user ? <SkillForUser /> : <SkillForStranger />}
	</>
}

function SkillForUser() {
	const { params } = useRouteMatch()
	const { skillId } = params
	const { loading, error, data } = useSkillQuery(skillId)
	const [submitActionToServer, { loading: submissionLoading, error: submissionError }] = useSubmitExerciseActionMutation(skillId)
	const [startNewExerciseOnServer, { loading: newExerciseLoading, error: newExerciseError }] = useStartExerciseMutation(skillId)

	// Set up callbacks for the exercise component.
	const startNewExercise = useCallback(() => {
		startNewExerciseOnServer()
	}, [startNewExerciseOnServer])
	const submitAction = useCallback((action, processAction) => {
		// ToDo later: implement processAction, if it's given, to set up an optimistic response.
		submitActionToServer({ variables: { action } })
	}, [submitActionToServer])

	// If there is no exercise, start one.
	const exercise = data && data.skill && data.skill.currentExercise
	useEffect(() => {
		if (!loading && !exercise)
			startNewExercise()
	}, [loading, exercise, startNewExercise])

	// Any errors we should notify the user of?
	if (error)
		return <Error data={error} />
	if (submissionError)
		return <Error data={submissionError} />
	if (newExerciseError)
		return <Error data={newExerciseError} />

	// Anything still loading?
	if (loading)
		return <Loading text="Loading skill data." />
	if (newExerciseLoading)
		return <Loading text="Generating new exercise." />
	if (!exercise)
		return <Loading text="No exercise yet. Generating one." />

	// All fine! Display the exercise.
	return <ExerciseContainer exercise={exercise} skillId={skillId} submitting={submissionLoading} submitAction={submitAction} startNewExercise={startNewExercise} />
}

function SkillForStranger() {
	return <p>Not logged in. Still implementing this...</p>
	// const { params } = useRouteMatch()
	// const { skillId } = params
	// const user = useUser()
	// const { loading, error, data } = useQuery(SKILL, { variables: { id: skillId } })

	// // 
	// console.log('Test')	
	// console.log(loading)
	// console.log(error)
	// console.log(data)



	// // Use a state to track exercise data. Generate new data on a change in skill ID.
	// const [exercise, setExercise] = useState(null)
	// const [counter, incrementCounter] = useCounter()
	// const startNewExercise = () => {
	// 	incrementCounter() // Use a key to enforce a new loader on every new exercise. Otherwise we may see the solution of the old exercise when the state changes.
	// 	setExercise(getNewExercise(skillId))
	// }
	// useEffect(startNewExercise, [skillId])

	// return <>
	// 	{/* {exercise ? <ExerciseContainer key={counter} {...exercise} startNewExercise={startNewExercise} skillId={skillId} /> : null} */}
	// </>
}

export function useSkillTitle() {
	const { params } = useRouteMatch()
	const { skillId } = params
	const skill = skills[skillId]

	if (!skill)
		return 'Unknown skill'
	return skill.name
}
