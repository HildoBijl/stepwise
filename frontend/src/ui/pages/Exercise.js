import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

const EXERCISE = gql`{query exercises(id: $id) { name, id }}`

export default function Exercises() {
	const contents = useContents()

	return (
		<>
			{contents}
		</>
	)
}

function useContents() {
	const { exerciseId } = useParams()
	const { loading, error, data } = useQuery(EXERCISE, { variables: { id: exerciseId } })

	if (loading) return <p>Loading...</p>
	if (error) return <p>Error{JSON.stringify(error)}</p>

	return <>
		<h1>Exercise ID: {exerciseId}</h1>
		<p>{JSON.stringify(data)}</p>
	</>
}
