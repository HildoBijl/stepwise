import React from 'react'

export default function Problem({ state }) {
	const { a, b, c, d } = state
	return <span>Calculate {a}*{b} + {c}*{d}.</span>
}
