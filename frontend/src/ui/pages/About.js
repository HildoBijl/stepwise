import React from 'react'
import Page from '../layout/Page'

import { Button, Typography } from '@material-ui/core'

export default function About() {
	return (
		<Page>
		<Typography variant='body1'>This can be an about page.</Typography>
			<Button variant="contained" color="primary">
				Hello World
    	</Button>
		</Page>
	)
}
