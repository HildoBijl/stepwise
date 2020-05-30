import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { useRouteMatch, Link } from 'react-router-dom'

import Page from '../layout/Page'

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
	const match = useRouteMatch()

	if (loading) return <p>Loading...</p>
	if (error) return <p>Error</p>

	return (
		<ul>
			{data.exercises.map(e => <li key={e.id}><Link to={`${match.url}/${e.id}`}>{e.name}</Link></li>)}
		</ul>
	)
}
