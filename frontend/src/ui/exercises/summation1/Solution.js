import React from 'react'

export default function Solution({ state }) {
	const { a, b } = state
	
	return <>
		<h3>Solution</h3>
		<span>The solution is {a} + {b} = {a + b}.</span>
	</>
}
