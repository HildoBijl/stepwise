import React from 'react'

export default function Solution({ state }) {
	const { a, b, c } = state
	return <span>The solution is {a}*{b} + {c} = {a * b + c}.</span>
}