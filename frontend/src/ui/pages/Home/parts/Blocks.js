import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Container, Grid, Button, useTheme } from '@mui/material'
import { Info as InfoIcon } from '@mui/icons-material'

import { M } from '@step-wise/math-display'
import { Beam, Force, HingeSupport, RollerHingeSupport } from '@step-wise/engineering-diagrams'

import { TranslationSection, Translation } from 'i18n'
import { Student, Teacher, SignInButtons } from 'ui/components'
import { usePaths } from 'ui/routingTools'
import { Drawing, SvgPortal, HtmlElement } from '@step-wise/drawing'

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
					<SignInButtons />
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
									whiteSpace: 'nowrap',
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
	const lineStyle = { fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinejoin: 'round', strokeMiterlimit: 10 }
	const textScale = 0.85

	return <Drawing view={{ type: 'identity', width: 48, height: 32 }} style={{ flex: '0 0 48px', margin: '0 0 0 8px', padding: 0, width: 48 }}>
		<SvgPortal>
			<path style={lineStyle} d="M44.8,16.5L14.7,28.7L4.4,3.3L44.8,16.5z" />
			<HtmlElement position={[36, 27]} scale={textScale}><M>a</M></HtmlElement>
			<HtmlElement position={[3, 21]} scale={textScale}><M>b</M></HtmlElement>
			<HtmlElement position={[28, 2]} scale={textScale}><M>c</M></HtmlElement>
		</SvgPortal>
	</Drawing>
}

function StructureImage() {
	const theme = useTheme()
	const supportProps = {
		groundProps: { height: 7.2, width: 30 },
		height: 12,
		hingeProps: { fill: theme.palette.secondary.main, r: 3.6 },
		thickness: 1.2,
		triangleProps: { fill: theme.palette.secondary.main },
		width: 19.2,
	}

	return <Drawing view={{ type: 'identity', width: 120, height: 32 }} style={{ flex: '0 0 96px', margin: '0 0 0 8px', padding: 0, width: 96 }}>
		<Beam positions={[[16, 5.8], [104, 5.8]]} thickness={3} />
		<HingeSupport {...supportProps} position={[16, 5.8]} />
		<RollerHingeSupport {...supportProps} position={[104, 5.8]} wheelRadius={2.4} />
		<Force angle={Math.PI / 2} applicationPointAt="start" length={{ pixelDistance: 24.6 }} position={[48.3, 5.5]} strokeWidth={2} />
		<Force angle={Math.PI / 2} applicationPointAt="start" length={{ pixelDistance: 24.6 }} position={[71.7, 5.5]} strokeWidth={2} />
	</Drawing>
}
