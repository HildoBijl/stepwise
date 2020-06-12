import React from 'react'

export default function Problem({ state }) {
	const { a, b, c } = state
	return <span>Calculate {a}*{b} + {c}.</span>
}
