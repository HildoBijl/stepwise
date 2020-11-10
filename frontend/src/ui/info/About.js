import React from 'react'
import { useHistory } from 'react-router-dom'
import { Button, Typography } from '@material-ui/core'

import cookies from 'ui/cookies'
import { usePaths } from 'ui/routing'

export default function About() {
	const paths = usePaths()
	const history = useHistory()

	console.log(cookies)
	console.log(cookies.get('test1'))
	console.log(cookies.get('test2'))
	// const [cookies, setCookie, removeCookie] = useCookies(['test1','test2'])
	// console.log(cookies)
	// console.log(setCookie)
	// console.log(removeCookie)

	return (
		<>
			<Typography variant='body1'>Dit is een info-pagina.</Typography>
			<div style={{ margin: '0.8rem 0'}}><Button variant="contained" color="secondary" onClick={() => history.push(paths.history())}>Geschiedenis</Button></div>
			<div style={{ margin: '0.8rem 0'}}><Button variant="contained" color="primary" onClick={() => history.push(paths.skillTrackerExplainer())}>Over de skill tracker</Button></div>
			<div style={{ margin: '0.8rem 0'}}><Button variant="contained" color="secondary" onClick={() => cookies.set('test1', 3)}>Plaats cookie 1</Button></div>
			<div style={{ margin: '0.8rem 0'}}><Button variant="contained" color="secondary" onClick={() => cookies.set('test2', 4)}>Plaats cookie 2</Button></div>
		</>
	)
}