import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'

import { websiteName, websiteNameAddendum } from 'settings'
import { useTextTranslator } from 'i18n'
import logo from 'ui/images/logoAlternate.svg'
import { Rectangle } from 'ui/components'

const useStyles = makeStyles((theme) => ({
	titleBar: {
		display: 'flex',
		flexFlow: 'row nowrap',
		flexDirection: 'row-reverse',
		paddingBottom: 'min(4vw,51px)',
	},
	logoContainer: {
		padding: 'min(3vw,38px)',
	},
	titleContainer: {
		color: theme.palette.primary.contrastText,
		fontSize: 'min(9vw,116px)',
		marginTop: 'min(3vw,38px)',
		position: 'relative',
		verticalAlign: 'bottom',

		'& > div': {
			bottom: 0,
			left: 0,
			position: 'absolute',
		},
	},
	subtitleContainer: {
		color: theme.palette.secondary.main,
		fontSize: 'min(3.5vw,45px)',
	},
}))

export function TitleBar() {
	// Load language-dependent texts.
	const translate = useTextTranslator('main')
	const websiteNameTranslation = translate(websiteName, 'websiteName')
	const websiteNameAddendumTranslation = translate(websiteNameAddendum, 'websiteNameAddendum')

	const classes = useStyles()
	return <Container maxWidth='lg' className={classes.titleBar}>
		<Grid container direction="row">
			<Grid item xs={4} className={classes.logoContainer}>
				<Rectangle aspectRatio={0.8}>
					<img src={logo} className="logoPicture" alt="Step-Wise Logo" width="100%" height="100%" />
				</Rectangle>
			</Grid>
			<Grid item container direction="column" xs={8}>
				<Grid item xs className={classes.titleContainer}>
					{websiteNameTranslation}
				</Grid>
				<Grid item xs className={classes.subtitleContainer}>
					{websiteNameAddendumTranslation}
				</Grid>
			</Grid>
		</Grid>
	</Container>
}
