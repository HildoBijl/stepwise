import React from 'react'

export default function Solution({ state }) {
	const { a, b, c, d } = state
	return <span>The solution is {a}*{b} + {c}*{d} = {a * b + c * d}.</span>
}
