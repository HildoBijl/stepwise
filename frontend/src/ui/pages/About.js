import React from 'react'
import Page from '../layout/Page'

import Button from '@material-ui/core/Button'
import { useTheme } from '@material-ui/core/styles'

export default function About() {
	const theme = useTheme()
	console.log(theme)

	return (
		<Page>
			<h1>About</h1>
			<Button variant="contained" color="primary">
				Hello World
    	</Button>
			<span>{JSON.stringify(theme)}</span>
		</Page>
	)
}
