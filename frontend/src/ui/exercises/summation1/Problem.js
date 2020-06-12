import React from 'react'

export default function Problem({ state }) {
	const { a, b } = state
	return <span>Calculate the sum {a} + {b}.</span>
}
