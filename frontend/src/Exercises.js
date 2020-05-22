import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

const EXERCISES = gql`{exercises{name,id}}`

export function Exercises() {
	const { loading, error, data } = useQuery(EXERCISES)

	if (loading) return <p>Loading...</p>
	if (error) return <p>Error</p>

	return <>
		<h1>Exercises</h1>
		<ul>
			{data.exercises.map(e => <li key={e.id}>{e.name}</li>)}
		</ul>
	</>
}
