import React from 'react'

export default function Problem({ state, prevInput, result }) {
	const { a, b } = state
	return <span>Calculate the product {a}*{b}.</span>
}
