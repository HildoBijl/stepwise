import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Container, Grid, Button, useTheme } from '@mui/material'
import { Info as InfoIcon } from '@mui/icons-material'

import { TranslationSection, Translation } from 'i18n'
import { Student, Teacher, M, LogInButtons } from 'ui/components'
import { usePaths } from 'ui/routingTools'
import { Drawing, useIdentityTransformationSettings, SvgPortal, Element } from 'ui/figures'

export function Blocks() {
	const paths = usePaths()
	const navigate = useNavigate()

	return <Container maxWidth='lg' disableGutters sx={theme => ({
		'& .block': {
			marginBottom: '0.5em',
			textAlign: 'center',
			'& .title': {
				fontWeight: 'bold',
				textAlign: 'center',
				fontSize: '1.2em',
				[theme.breakpoints.up('md')]: {
					fontSize: '1.5em',
				}
			},
			'& .description': {
				textAlign: 'center',
				fontSize: '1em',
				[theme.breakpoints.up('md')]: {
					fontSize: '1.2em',
				}
			},
		},
	})}>
		<Grid container columnSpacing={0} rowSpacing={2}>
			<Grid size={{ xs: 12, md: 6, lg: 4 }} className="block">
				<TranslationSection entry="getStarted">
					<Box className="title"><Translation entry="title">Get started</Translation></Box>
					<Box className="description"><Translation entry="description">Sign in to directly start practicing.</Translation></Box>
					<LogInButtons />
				</TranslationSection>
			</Grid>
			<Grid size={{ xs: 12, md: 6, lg: 4 }} className="block">
				<TranslationSection entry="explainers">
					<Box className="title"><Translation entry="title">Explainers</Translation></Box>
					<Box className="description"><Translation entry="description">Briefly read up on what Step-Wise is.</Translation></Box>
					<Box sx={{
						alignItems: 'center',
						display: 'flex',
						flexFlow: 'column nowrap',
						margin: '4px',
						'& > button': {
							margin: '4px',
							width: '280px',
						},
					}}>
						<Button variant="contained" className="button" startIcon={<Student />} onClick={() => navigate(paths.forStudents())} color="primary"><Translation entry="buttons.forStudents">Step-Wise for students</Translation></Button>
						<Button variant="contained" className="button" startIcon={<Teacher />} onClick={() => navigate(paths.forTeachers())} color="primary"><Translation entry="buttons.forTeachers">Step-Wise for teachers</Translation></Button>
						<Button variant="contained" className="button" startIcon={<InfoIcon />} onClick={() => navigate(paths.about())} color="primary"><Translation entry="buttons.about">About Step-Wise</Translation></Button>
					</Box>
				</TranslationSection>
			</Grid>
			<Grid size={{ xs: 12, md: 12, lg: 4 }} className="block">
				<TranslationSection entry="exampleSkills">
					<Box className="title"><Translation entry="title">Example skills</Translation></Box>
					<Box className="description"><Translation entry="description">Try out for yourself how it works.</Translation></Box>
					<Grid container spacing={0} sx={{
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
					}}>
						<Grid size={{ xs: 12, md: 3, lg: 6 }}>
							<Button variant="contained" className="button" onClick={() => navigate(paths.skill({ skillId: 'solveMultiVariableLinearEquation' }))} color="secondary">
								<TranslationSection entry="algebra">
									<Box className="container">
										<Box><Translation entry="title">Algebra</Translation></Box>
										<Box className="example">
											<Translation entry="contents">
												Solve&nbsp;&nbsp;<M>\left(ax+b\right)\!y = cx</M>
											</Translation>
										</Box>
									</Box>
								</TranslationSection>
							</Button>
						</Grid>
						<Grid size={{ xs: 12, md: 3, lg: 6 }}>
							<Button variant="contained" className="button" onClick={() => navigate(paths.skill({ skillId: 'applyPythagoreanTheorem' }))} color="secondary">
								<TranslationSection entry="geometry">
									<Box className="container">
										<Box><Translation entry="title">Geometry</Translation></Box>
										<Box className="example">
											<Translation entry="contents">
												<span>Calculate <M>b</M> in </span><PythagorasImage />
											</Translation>
										</Box>
									</Box>
								</TranslationSection>
							</Button>
						</Grid>
						<Grid size={{ xs: 12, md: 3, lg: 6 }}>
							<Button variant="contained" className="button" onClick={() => navigate(paths.skill({ skillId: 'gasLaw' }))} color="secondary">
								<TranslationSection entry="thermodynamics">
									<Box className="container">
										<Box><Translation entry="title">Thermodynamics</Translation></Box>
										<Box className="example">
											<Translation entry="contents">
												Apply&nbsp;&nbsp;<M>pV \! = mR_sT</M>
											</Translation>
										</Box>
									</Box>
								</TranslationSection>
							</Button>
						</Grid>
						<Grid size={{ xs: 12, md: 3, lg: 6 }}>
							<Button variant="contained" className="button" onClick={() => navigate(paths.skill({ skillId: 'calculateBasicSupportReactions' }))} color="secondary">
								<TranslationSection entry="statics">
									<Box className="container">
										<Box><Translation entry="title">Statics</Translation></Box>
										<Box className="example">
											<Translation entry="contents">
												<span>Analyze </span><StructureImage />
											</Translation>
										</Box>
									</Box>
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
