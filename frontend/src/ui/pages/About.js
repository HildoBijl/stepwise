import React from 'react'
import { useHistory } from 'react-router-dom'
import { Button, Typography } from '@material-ui/core'
import { usePaths } from '../routing'

import * as st from 'step-wise/skillTracking'
import * as cb from 'step-wise/util/combinatorics'
import { numberArray } from 'step-wise/util/arrays'

export default function About() {
	const paths = usePaths()
	const history = useHistory()

	// This is test code.
	// const coef = [1/6, 1/3, 1/2]
	// const coef = [0, 1/2, 1/2]
	let coef = [0, 0, 1]
	// const coef = [1 / 2, 0, 0, 0, 1 / 2]
	window.c = coef
	window.st = st
	window.cb = cb
	let f = st.getFunction(coef)

	const num = 10
	const nums = numberArray(0, num)
	console.log(st.getData(coef))
	console.log(nums.map(index => [index / num, f(index / num)]))
	coef = st.smoothenCoef(coef, 99)
	f = st.getFunction(coef)
	console.log(nums.map(index => [index / num, f(index / num)]))

	return (
		<>
			<Typography variant='body1'>Dit is een info-pagina.</Typography>
			<Button variant="contained" color="secondary" onClick={() => history.push(paths.history())}>Geschiedenis</Button>
			<Button variant="contained" color="primary" onClick={() => history.push(paths.skillTrackerExplainer())}>Over de skill tracker</Button>
		</>
	)
}