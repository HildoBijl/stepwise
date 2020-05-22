import React from 'react'
import Page from '../layout/Page'

import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

const EXERCISES = gql`{exercises{name,id}}`

export default function Exercises() {
	const contents = useContents()

	return (
		<Page>
			<h1>Exercises</h1>
			{contents}
		</Page>
	)
}

function useContents() {
	const { loading, error, data } = useQuery(EXERCISES)

	if (loading) return <p>Loading...</p>
	if (error) return <p>Error</p>

	return (
		<ul>
			{data.exercises.map(e => <li key={e.id}>{e.name}</li>)}
		</ul>
	)
}
