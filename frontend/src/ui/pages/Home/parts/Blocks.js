import React from 'react'
import { useNavigate } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { Info as InfoIcon } from '@material-ui/icons'

import { TranslationSection, Translation } from 'i18n'
import { Student, Teacher } from 'ui/components'
import { usePaths } from 'ui/routingTools'

import { LogInButtons } from './LogInButtons'

const useStyles = makeStyles((theme) => ({
	container: {},
	block: {
		marginBottom: '0.5em',
		textAlign: 'center',
	},
	title: {
		fontWeight: 'bold',
		textAlign: 'center',
		
		fontSize: '1.2em',
		[theme.breakpoints.up('md')]: {
			fontSize: '1.5em',
		}
	},
	description: {
		textAlign: 'center',
		
		fontSize: '1em',
		[theme.breakpoints.up('md')]: {
			fontSize: '1.2em',
		}
	},
	explainerButtons: {
		alignItems: 'center',
		display: 'flex',
		flexFlow: 'column nowrap',
		margin: '4px',

		'& > button': {
			margin: '4px',
			width: '280px',
		},
	},
}))

export function Blocks() {
	const paths = usePaths()
	const navigate = useNavigate()

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
					<div className={classes.explainerButtons}>
						<Button variant="contained" className="button" startIcon={<Student />} onClick={() => navigate(paths.forStudents())} color="primary"><Translation entry="buttons.forStudents">Step-Wise for students</Translation></Button>
						<Button variant="contained" className="button" startIcon={<Teacher />} onClick={() => navigate(paths.forTeachers())} color="primary"><Translation entry="buttons.forTeachers">Step-Wise for teachers</Translation></Button>
						<Button variant="contained" className="button" startIcon={<InfoIcon />} onClick={() => navigate(paths.about())} color="primary"><Translation entry="buttons.about">About Step-Wise</Translation></Button>
					</div>
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
