import React from 'react'

export default function Solution({ state }) {
	const { a, b } = state
	return <span>The solution is {a} + {b} = {a + b}.</span>
}
