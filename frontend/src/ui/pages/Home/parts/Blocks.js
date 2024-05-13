import React from 'react'
import { useNavigate } from 'react-router-dom'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { Info as InfoIcon } from '@material-ui/icons'

import { TranslationSection, Translation } from 'i18n'
import { Student, Teacher, M } from 'ui/components'
import { usePaths } from 'ui/routingTools'
import { Drawing, useIdentityTransformationSettings, SvgPortal, Element } from 'ui/figures'

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
	exampleSkillButtons: {
		margin: '4px',

		'& button': {
			margin: '4px',
			maxWidth: '280px',
			width: '96%',

			'& .container': {
				display: 'flex',
				flexFlow: 'column nowrap',

				'& .example': {
					alignItems: 'center',
					display: 'flex',
					flexFlow: 'row nowrap',
					height: '32px',
					opacity: 0.85,
					textTransform: 'none',
				},
			}
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
					<div className={classes.description}><Translation entry="description">Try out for yourself how it works.</Translation></div>
					<Grid container spacing={0} className={classes.exampleSkillButtons}>
						<Grid item xs={12} md={3} lg={6}>
							<Button variant="contained" className="button" onClick={() => navigate(paths.skill({ skillId: 'solveBasicLinearEquation' }))} color="secondary">
								<TranslationSection entry="algebra">
									<div className="container">
										<div><Translation entry="title">Algebra</Translation></div>
										<div className="example">
											<Translation entry="contents">
												Solve&nbsp;&nbsp;<M>\left(ax+b\right)y = cx</M>
											</Translation>
										</div>
									</div>
								</TranslationSection>
							</Button>
						</Grid>
						<Grid item xs={12} md={3} lg={6}>
							<Button variant="contained" className="button" onClick={() => navigate(paths.skill({ skillId: 'applyPythagoreanTheorem' }))} color="secondary">
								<TranslationSection entry="geometry">
									<div className="container">
										<div><Translation entry="title">Geometry</Translation></div>
										<div className="example">
											<Translation entry="contents">
												<span>Calculate <M>b</M> in </span><PythagorasImage />
											</Translation>
										</div>
									</div>
								</TranslationSection>
							</Button>
						</Grid>
						<Grid item xs={12} md={3} lg={6}>
							<Button variant="contained" className="button" onClick={() => navigate(paths.skill({ skillId: 'gasLaw' }))} color="secondary">
								<TranslationSection entry="thermodynamics">
									<div className="container">
										<div><Translation entry="title">Thermodynamics</Translation></div>
										<div className="example">
											<Translation entry="contents">
												Apply&nbsp;&nbsp;<M>pV = mR_sT</M>
											</Translation>
										</div>
									</div>
								</TranslationSection>
							</Button>
						</Grid>
						<Grid item xs={12} md={3} lg={6}>
							<Button variant="contained" className="button" onClick={() => navigate(paths.skill({ skillId: 'calculateBasicSupportReactions' }))} color="secondary">
								<TranslationSection entry="statics">
									<div className="container">
										<div><Translation entry="title">Statics</Translation></div>
										<div className="example">
											<Translation entry="contents">
												<span>Analyze </span><StructureImage />
											</Translation>
										</div>
									</div>
								</TranslationSection>
							</Button>
						</Grid>
					</Grid>
				</TranslationSection>
			</Grid>
		</Grid>
	</Container>
}

function PythagorasImage() {
	const transformationSettings = useIdentityTransformationSettings(48, 32)
	const lineStyle = { fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinejoin: 'round', strokeMiterlimit: 10 }
	const textScale = 0.85

	return <Drawing transformationSettings={transformationSettings} style={{ margin: '0 0 0 8px', padding: 0 }}>
		<SvgPortal>
			<path style={lineStyle} d="M44.8,16.5L14.7,28.7L4.4,3.3L44.8,16.5z" />
			<Element position={[36, 27]} scale={textScale}><M>a</M></Element>
			<Element position={[3, 21]} scale={textScale}><M>b</M></Element>
			<Element position={[28, 2]} scale={textScale}><M>c</M></Element>
		</SvgPortal>
	</Drawing>
}

function StructureImage() {
	const transformationSettings = useIdentityTransformationSettings(120, 32)
	const theme = useTheme()

	const beamStyle = { fill: 'none', stroke: 'currentColor', strokeWidth: 3 }
	const groundStyle = { fill: 'currentColor', opacity: 0.4 }
	const groundLineStyle = { stroke: 'currentColor', strokeWidth: 1.2 }
	const supportStyle = { fill: theme.palette.secondary.main, stroke: 'currentColor', strokeWidth: 1.2, strokeLinejoin: 'round' }
	const wheelStyle = { fill: 'currentColor' }
	const forceLineStyle = { stroke: 'currentColor', strokeWidth: 2 }
	const forceArrowHeadStyle = { fill: 'currentColor' }

	return <Drawing transformationSettings={transformationSettings} style={{ margin: '0 0 0 8px', padding: 0 }}>
		<SvgPortal>
			<line style={beamStyle} x1="16" y1="5.8" x2="104" y2="5.8" />

			<rect style={groundStyle} x="89" y="23.8" width="30" height="7.2" />
			<path style={groundLineStyle} d="M89,23.8h30" />
			<polygon style={supportStyle} points="104,5.8 94.4,17.8 113.6,17.8 " />
			<circle style={supportStyle} cx="104" cy="5.8" r="3.6" />

			<circle style={wheelStyle} cx="96.8" cy="20.8" r="2.4" />
			<circle style={wheelStyle} cx="101.6" cy="20.8" r="2.4" />
			<circle style={wheelStyle} cx="106.4" cy="20.8" r="2.4" />
			<circle style={wheelStyle} cx="111.2" cy="20.8" r="2.4" />

			<rect style={groundStyle} x="1" y="17.8" width="30" height="7.2" />
			<path style={groundLineStyle} d="M1,17.8h30" />
			<polygon style={supportStyle} points="16,5.8 6.4,17.8 25.6,17.8 " />
			<circle style={supportStyle} cx="16" cy="5.8" r="3.6" />

			<path style={forceLineStyle} d="M71.7,5.5v20.9" />
			<polygon style={forceArrowHeadStyle} points="71.7,30.1 76.5,20.5 71.7,23.4 66.9,20.5" />

			<path style={forceLineStyle} d="M48.3,5.5v20.9" />
			<polygon style={forceArrowHeadStyle} points="48.3,30.1 53.1,20.5 48.3,23.4 43.5,20.5" />
		</SvgPortal>
	</Drawing>
}
