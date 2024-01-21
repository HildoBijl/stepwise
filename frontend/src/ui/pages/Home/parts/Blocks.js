import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'

import { TranslationSection, Translation } from 'i18n'

import { LogInButtons } from './LogInButtons'

const useStyles = makeStyles((theme) => ({
	container: {

	},
	block: {
		marginBottom: '1em',
		textAlign: 'center',
	},
	title: {
		fontSize: '1.5em',
		fontWeight: 'bold',
		textAlign: 'center',
	},
	description: {
		fontSize: '1.2em',
		textAlign: 'center',
	},
}))

export function Blocks() {
	const classes = useStyles()
	return <Container maxWidth='lg' className={classes.container}>
		<Grid container spacing={2}>
			<Grid item xs={12} md={6} lg={4} className={classes.block}>
				<TranslationSection entry="getStarted">
					<div className={classes.title}><Translation entry="title">Get started</Translation></div>
					<div className={classes.description}><Translation entry="description">Sign in to directly start practicing.</Translation></div>
					<LogInButtons />
				</TranslationSection>
			</Grid>
			<Grid item xs={12} md={6} lg={4} className={classes.block}>
				<TranslationSection entry="explainers">
					<div className={classes.title}><Translation entry="title">Explainers</Translation></div>
					<div className={classes.description}><Translation entry="description">Briefly read up on what Step-Wise is.</Translation></div>
				</TranslationSection>
			</Grid>
			<Grid item xs={12} md={12} lg={4} className={classes.block}>
				<TranslationSection entry="exampleSkills">
					<div className={classes.title}><Translation entry="title">Example skills</Translation></div>
					<div className={classes.description}><Translation entry="description">Try out for yourself how intuitive it works.</Translation></div>
				</TranslationSection>
			</Grid>
		</Grid>
	</Container>
}
