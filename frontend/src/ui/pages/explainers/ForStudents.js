import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { Check as CheckIcon, Clear as ClearIcon, Replay as ReplayIcon } from '@material-ui/icons'

import { Skill, getEV, getMaxLikelihood, smoothen } from 'step-wise/skillTracking'

import { TranslationSection, Translation, Check } from 'i18n'
import { useIsSignedIn } from 'api/user'
import { usePaths } from 'ui/routingTools'
import { Par, Head, SubHead, Button, M } from 'ui/components'
import { Drawing, useIdentityTransformationSettings, SvgPortal, Element } from 'ui/figures'
import { SkillFlask } from 'ui/eduTools'

import { PageTranslationFile } from '../PageTranslationFile'

export function ForStudents() {
	const paths = usePaths()
	const isSignedIn = useIsSignedIn()
	return <PageTranslationFile page="explainers/forStudents">
		<Par><Translation entry="intro">People learn best by doing. That's why Step-Wise is focused around (1) you <strong>practicing</strong>, and (2) on <strong>coaching</strong> you to practice on your level.</Translation></Par>

		<TranslationSection entry="practice">
			<Head><Translation entry="head">Practice</Translation></Head>
			<Par><Translation entry="intro">When starting to practice, it helps to know the <strong>structure</strong> behind Step-Wise.</Translation></Par>

			<TranslationSection entry="skills">
				<SubHead><Translation entry="head">Focused around skills</Translation></SubHead>
				<Par><Translation entry="par1">In Step-Wise, all educational content is split up into small <strong>skills</strong>: something that you can actually do. Every skill has roughly 2-10 minutes worth of information. We'll tell you exactly how it works, from an intuitive point of view, and which steps you need to take to apply said skill.</Translation></Par>
				<TheoryImage />
			</TranslationSection>

			<TranslationSection entry="feedback">
				<SubHead><Translation entry="head">Exercises give specific feedback</Translation></SubHead>
				<Par><Translation entry="par1">Everyone makes small mistakes every now and then. When you do, we have you covered. You'll get <strong>specific feedback</strong> on where the error might be. This teaches you to find your own mistakes, so that you won't make them anymore in the future.</Translation></Par>
				<PracticeImage />
			</TranslationSection>

			<TranslationSection entry="steps">
				<SubHead><Translation entry="head">Split up exercises into steps</Translation></SubHead>
				<Par><Translation entry="par1">If you've got no idea on how to solve an exercise, then you can always <strong>split it up into steps</strong>. Each step is a skill that you've practiced before, ensuring that you'll reach the final result. On top of that, each step always has clear and intuitive solutions.</Translation></Par>
				<StepsImage />
			</TranslationSection>
		</TranslationSection>

		<TranslationSection entry="coaching">
			<Head><Translation entry="head">Coaching</Translation></Head>
			<Par><Translation entry="intro">The hardest part of studying is knowing <strong>where to start</strong>, and <strong>what to practice next</strong>. This is exactly where Step-Wise shines.</Translation></Par>

			<TranslationSection entry="tracking">
				<SubHead><Translation entry="head">Live progress tracking</Translation></SubHead>
				<Par><Translation entry="par1">For every skill, we constantly <strong>estimate the chance</strong> that you're going to apply it correctly on the next attempt. Obviously we share these estimates with you too, so you know where you stand. Curious how it works? Try it out for yourself!</Translation></Par>
				<SingleSkillTrial showLabel={false} />
				<Par><Translation entry="par2">The above is only for a single skill. In practice we also take into account lots of other factors, like links between skills, time decay, and more.</Translation></Par>
			</TranslationSection>

			<TranslationSection entry="recommendations">
				<SubHead><Translation entry="head">Skill-tree-based practice recommendations</Translation></SubHead>
				<Par><Translation entry="par1">Behind the scenes, Step-Wise makes heavy use of <strong>skill trees</strong>. You start with the basic skills at the top, and these skills then combine (form the steps of) the more advanced skills below them. Through this tree structure, we can always tell you exactly what the right skill is for you to practice next. It also gives you a good overview of how far along you are in the course.</Translation></Par>
				<SkillTreeImage />
			</TranslationSection>

			<TranslationSection entry="deficiencies">
				<SubHead><Translation entry="head">Deficiency detection and tackling</Translation></SubHead>
				<Par><Translation entry="par1">When you're struggling with the exercises of a skill, we're also there for you. Keep in mind: every exercise can be split up into steps. This doesn't only help you, but it also allows us to figure out exactly what you're struggling with. So when we notice something is up, we can recommend you to <strong>separately practice a specific subskill</strong> a bit more. Doing so allows you to tackle your deficiency and come back stronger.</Translation></Par>
				<DeficiencyImage />
			</TranslationSection>
		</TranslationSection>

		<TranslationSection entry="getStarted">
			<Head><Translation entry="head">Get started</Translation></Head>
			<Par><Translation entry="intro">Want to try it out? <Check value={isSignedIn}><Check.True>Head to the <Link to={isSignedIn && paths.courses()}>Courses page</Link> and start practicing.</Check.True><Check.False>Head back to the <Link to={!isSignedIn && paths.home()}>home page</Link>, sign in (it's free!) and start practicing.</Check.False></Check></Translation></Par>
		</TranslationSection>
	</PageTranslationFile>
}

// Define page-wide image settings.
const background = '#e7e7e7'
const activeTabStyle = { fill: '#333333', stroke: background, strokeWidth: '1px', strokeMiterlimit: 10 }
const inactiveTabStyle = { ...activeTabStyle, fill: '#555555' }
const tabTextStyle = { color: '#ffffff', fontWeight: 'bold', fontSize: '16px' }
const headStyle = { fontWeight: 'bold' }
const textStyle = { fontSize: '18px' }
const fieldStyle = { fill: '#ffffff', stroke: '#000000', strokeMiterlimit: 10 }
const buttonStyle = { fill: inactiveTabStyle.fill }
const buttonTextStyle = { color: '#ffffff', fontSize: '12px' }

function TheoryImage() {
	const transformationSettings = useIdentityTransformationSettings(600, 300)
	return <TranslationSection entry="theoryImage">
		<Drawing transformationSettings={transformationSettings}>
			<SvgPortal>
				<rect width="100%" height="100%" fill={background} />

				<rect style={activeTabStyle} width="200" height="60" />
				<rect style={inactiveTabStyle} x="200" width="200" height="60" />
				<rect style={inactiveTabStyle} x="400" width="200" height="60" />

				<Element position={[100, 30]}><span style={tabTextStyle}><Translation entry="theory">Theory</Translation></span></Element>
				<Element position={[300, 30]}><span style={tabTextStyle}><Translation entry="practice">Practice</Translation></span></Element>
				<Element position={[500, 30]}><span style={tabTextStyle}><Translation entry="background">Background</Translation></span></Element>

				<text transform="matrix(1 0 0 1 20.7243 95.7833)" style={{ ...headStyle, ...textStyle }}><Translation entry="head1">How it works</Translation></text>
				<text transform="matrix(1 0 0 1 20.7243 128.0612)" style={textStyle}>...</text>
				<text transform="matrix(1 0 0 1 20.7243 154.8336)" style={textStyle}>...</text>

				<text transform="matrix(1 0 0 1 20.7243 203.8867)" style={{ ...headStyle, ...textStyle }}><Translation entry="head2">The steps to take</Translation></text>
				<text transform="matrix(1 0 0 1 20.7243 236.1647)" style={textStyle}>...</text>
				<text transform="matrix(1 0 0 1 20.7243 262.9371)" style={textStyle}>...</text>
			</SvgPortal>
		</Drawing>
	</TranslationSection>
}

function PracticeImage() {
	const transformationSettings = useIdentityTransformationSettings(600, 220)
	return <TranslationSection entry="practiceImage">
		<Drawing transformationSettings={transformationSettings}>
			<SvgPortal>
				<rect width="100%" height="100%" fill={background} />

				<rect style={inactiveTabStyle} width="200" height="60" />
				<rect style={activeTabStyle} x="200" width="200" height="60" />
				<rect style={inactiveTabStyle} x="400" width="200" height="60" />

				<Element position={[100, 30]}><span style={tabTextStyle}><Translation entry="theory">Theory</Translation></span></Element>
				<Element position={[300, 30]}><span style={tabTextStyle}><Translation entry="practice">Practice</Translation></span></Element>
				<Element position={[500, 30]}><span style={tabTextStyle}><Translation entry="background">Background</Translation></span></Element>

				<Element position={[20, 80]} anchor={[0, 0]}><span><Translation entry="exercise">Calculate <M>28+46</M>.</Translation></span></Element>

				<path style={fieldStyle} d="M175.2,135.7c0,1.6-1.4,3-3,3H25c-1.6,0-3-1.4-3-3v-23.2c0-1.7,1.4-3,3-3h147.2c1.6,0,3,1.3,3,3V135.7z" />
				<Element position={[28, 114]} anchor={[0, 0]}><M>64</M></Element>
				<path d="M160,116c-4.4,0-8,3.6-8,8s3.6,8,8,8s8-3.6,8-8S164.4,116,160,116z M164,126.9l-1.1,1.1l-2.9-2.9l-2.9,2.9l-1.1-1.1l2.9-2.9 l-2.9-2.9l1.1-1.1l2.9,2.9l2.9-2.9l1.1,1.1l-2.9,2.9L164,126.9z" />

				<Element position={[28, 133]} anchor={[0, 0]}><span style={{ fontSize: '9px' }}><Translation entry="hint">Check the carry.</Translation></span></Element>

				<path style={buttonStyle} d="M580.3,190.1c0,1.6-1.3,2.9-2.8,2.9H444.9c-1.6,0-2.9-1.3-2.9-2.9v-23.5c0-1.6,1.3-2.9,2.9-2.9h132.5
		c1.6,0,2.8,1.3,2.8,2.9L580.3,190.1L580.3,190.1z"/>
				<Element position={[355, 177]}><span style={buttonTextStyle}><Translation entry="stepWiseButton">Solve this Step-Wise</Translation></span></Element>

				<path style={buttonStyle} d="M432.3,190c0,1.6-1.4,3-3,3H282.1c-1.6,0-3-1.4-3-3v-23.2c0-1.6,1.4-3,3-3h147.2c1.6,0,3,1.4,3,3
		L432.3,190L432.3,190z"/>
				<Element position={[510, 177]}><span style={buttonTextStyle}><Translation entry="submitButton">Submit and check</Translation></span></Element>
			</SvgPortal>
		</Drawing>
	</TranslationSection>
}

function StepsImage() {
	const transformationSettings = useIdentityTransformationSettings(600, 280)
	return <TranslationSection entry="practiceImage">
		<Drawing transformationSettings={transformationSettings}>
			<SvgPortal>
				<rect width="100%" height="100%" fill={background} />

				<rect style={inactiveTabStyle} width="200" height="60" />
				<rect style={activeTabStyle} x="200" width="200" height="60" />
				<rect style={inactiveTabStyle} x="400" width="200" height="60" />

				<Element position={[100, 30]}><span style={tabTextStyle}><Translation entry="theory">Theory</Translation></span></Element>
				<Element position={[300, 30]}><span style={tabTextStyle}><Translation entry="practice">Practice</Translation></span></Element>
				<Element position={[500, 30]}><span style={tabTextStyle}><Translation entry="background">Background</Translation></span></Element>

				<Element position={[20, 80]} anchor={[0, 0]}><span><Translation entry="exercise">Calculate <M>28+46</M>.</Translation></span></Element>

				<Element position={[20, 127]} anchor={[0, 0.5]}><span style={{ fontSize: '13px', fontWeight: 'bold' }}><Translation entry="step1">Step 1</Translation></span></Element>
				<line x1="74" y1="128" x2="589.7" y2="128" stroke="#000000" strokeMiterlimit="10" />

				<Element position={[20, 144]} anchor={[0, 0]}><span><Translation entry="exercise">Calculate <M>8+6</M>.</Translation></span></Element>

				<path style={fieldStyle} d="M175.2,200c0,1.6-1.4,3-3,3H25c-1.6,0-3-1.4-3-3v-23.2c0-1.7,1.4-3,3-3h147.2c1.6,0,3,1.3,3,3V200z" />
				<Element position={[28, 178]} anchor={[0, 0]}><M>14</M></Element>

				<path style={buttonStyle} d="M580.3,250c0,1.6-1.3,2.9-2.8,2.9H444.9c-1.6,0-2.9-1.3-2.9-2.9v-23.5c0-1.6,1.3-2.9,2.9-2.9h132.5 c1.6,0,2.8,1.3,2.8,2.9L580.3,250L580.3,250z" />
				<Element position={[355, 237]}><span style={buttonTextStyle}><Translation entry="giveUpButton">I give up this step</Translation></span></Element>

				<path style={buttonStyle} d="M432.3,250c0,1.6-1.4,3-3,3H282.1c-1.6,0-3-1.4-3-3v-23.2c0-1.6,1.4-3,3-3h147.2c1.6,0,3,1.4,3,3 L432.3,250L432.3,250z" />
				<Element position={[510, 237]}><span style={buttonTextStyle}><Translation entry="submitButton">Submit and check</Translation></span></Element>
			</SvgPortal>
		</Drawing>
	</TranslationSection>
}

const useStyles = makeStyles((theme) => ({
	applet: {
		background: 'rgba(128, 128, 128, 0.15)',
		borderRadius: '1.5rem',
		padding: '1rem 1.5rem',
	},

	flaskContainer: {
		alignItems: 'center',
		display: 'flex',
		flexFlow: 'row nowrap',
		margin: '0.6rem 0 1rem',

		'& svg': {
			flex: '0 0 auto',
		},
		'& .text': {
			flex: '1 1 auto',
			marginLeft: '1rem',
		},
	},

	buttonContainer: {
		alignItems: 'center',
		display: 'flex',
		flexFlow: 'row nowrap',
		justifyContent: 'flex-start',
		margin: '0.4rem 0',

		'& .action': {
			flex: '0 0 auto',
			fontWeight: 'bold',
			width: '100px',
		},
	},

	innerButtonContainer: {
		alignItems: 'center',
		display: 'flex',
		flex: '1 1 auto',
		flexFlow: 'row wrap',
		justifyContent: 'flex-start',

		'& button': {
			margin: '0.2rem 0.5rem 0.2rem 0',
		},
	},

	skillContainer: {
		alignItems: 'center',
		display: 'flex',
		flexFlow: 'row nowrap',
		justifyContent: 'flex-start',
		margin: '0.4rem 0 1rem',

		'& .skillLabel': {
			fontSize: '1.2em',
			fontWeight: 500,
		},
		'& .skillFlask': {
			margin: '0 1.2em 0 1em',
		},
	},

	slider: {
		margin: '0 0.8rem 0 0.5rem',
		width: '250px',
	},

	exerciseHeader: {
		fontSize: '1.5em',
		fontWeight: 500,
		margin: '0.2em 0',
	},

	infoMessage: {
		margin: '0.5em 0',
	},

	exerciseContainer: {
		alignItems: 'stretch',
		display: 'flex',
		flexFlow: 'column nowrap',
		margin: '1.5em 0 1em',

		'& .info': {
			margin: '0.2em 0',
		},

		'& table': {
			'& td': {
				padding: '0.1em 0.2em',
			},
			'& thead': {
				fontSize: '1em',
				fontWeight: 500,
				verticalAlign: 'bottom',
			},

			'& .number': {
				fontSize: '1.2em',
				fontWeight: 500,
				padding: '0.1em 0.4em 0.1em 0',
			},
			'& .exerciseName': {

			},
			'& .successRate, & .selectionRate': {
				textAlign: 'center',
			},
		},
	},
}))

function SingleSkillTrial() {
	const classes = useStyles()
	const label = 'X'

	// Keep track of the coefficients on changes.
	const [coef, setCoef] = useState([1])
	const [numPracticed, setNumPracticed] = useState(0)
	const applyUpdate = (correct) => {
		const options = {
			time: 0,
			applyPracticeDecay: true,
			numProblemsPracticed: numPracticed,
		}
		const coefficientSet = { [label]: smoothen(coef, options) }
		const setup = new Skill(label)
		const newCoefficientSet = setup.processObservation(coefficientSet, correct)
		setCoef(newCoefficientSet[label])
		setNumPracticed(numPracticed + 1)
	}
	const applyCorrect = () => applyUpdate(true)
	const applyIncorrect = () => applyUpdate(false)
	const reset = () => {
		setCoef([1])
		setNumPracticed(0)
	}

	// Apply smoothing based on the latest data.
	const options = {
		time: 0,
		applyPracticeDecay: true,
		numProblemsPracticed: numPracticed,
	}
	const smoothenedCoef = smoothen(coef, options)

	// Render contents.
	return <TranslationSection entry="applet">
		<div className={classes.applet}>
			<SkillFlaskWithLabel coef={smoothenedCoef} />
			<div className={classes.buttonContainer}>
				<div className={classes.innerButtonContainer}>
					<TranslationSection entry="buttons">
						<Button variant="contained" startIcon={<CheckIcon />} onClick={applyCorrect} color="primary"><Translation entry="correct">Correct</Translation></Button>
						<Button variant="contained" startIcon={<ClearIcon />} onClick={applyIncorrect} color="error"><Translation entry="incorrect">Incorrect</Translation></Button>
						<Button variant="contained" startIcon={<ReplayIcon />} onClick={reset} color="secondary"><Translation entry="reset">Reset</Translation></Button>
					</TranslationSection>
				</div>
			</div>
		</div>
	</TranslationSection>
}

function SkillFlaskWithLabel({ coef }) {
	const classes = useStyles()

	const EV = getEV(coef)
	const mainText = <Translation entry="estimate">The chance of a correct result is estimated to be {Math.round(EV * 100)}%.</Translation>

	const max = getMaxLikelihood(coef).f
	let addendum
	if (max < 1.2)
		addendum = <Translation entry="estimateAddendum1">But honestly we don't have a clue yet.</Translation>
	else if (max < 1.8)
		addendum = <Translation entry="estimateAddendum2">But it's still fairly uncertain.</Translation>
	else if (max < 2.4)
		addendum = <Translation entry="estimateAddendum3">This estimate has a bit of accuracy.</Translation>
	else if (max < 3)
		addendum = <Translation entry="estimateAddendum4">This is a fairly accurate estimate.</Translation>
	else if (max < 4)
		addendum = <Translation entry="estimateAddendum5">We're quite certain of this.</Translation>
	else
		addendum = <Translation entry="estimateAddendum6">This is based on a large number of exercises, and is hence an accurate estimation.</Translation>

	// Render the component.
	return (
		<div className={classes.flaskContainer}>
			<SkillFlask coef={coef} />
			<div className="text">{mainText} {addendum}</div>
		</div>
	)
}

function SkillTreeImage() {
	const transformationSettings = useIdentityTransformationSettings(600, 340)
	const lineStyle = { fill: 'none', stroke: '#404040', strokeWidth: '2', strokeMiterlimit: 10 }
	const blockStyle = { fill: lineStyle.stroke }

	return <Drawing transformationSettings={transformationSettings}>
		<SvgPortal>
			<path style={blockStyle} d="M100.4,48.8c0,5-4.1,9-9,9H18.5c-4.9,0-9-4-9-9v-29c0-4.9,4.1-9,9-9h72.9c4.9,0,9,4.1,9,9V48.8z" />
			<path style={blockStyle} d="M100.4,140.3c0,4.9-4.1,9-9,9H18.5c-4.9,0-9-4.1-9-9v-29c0-5,4.1-9,9-9h72.9c4.9,0,9,4,9,9V140.3z" />
			<path style={blockStyle} d="M209.3,48.8c0,5-4.1,9-9,9h-72.9c-4.9,0-9-4-9-9v-29c0-4.9,4.1-9,9-9h72.9c4.9,0,9,4.1,9,9V48.8z" />
			<path style={blockStyle} d="M209.3,140.3c0,4.9-4.1,9-9,9h-72.9c-4.9,0-9-4.1-9-9v-29c0-5,4.1-9,9-9h72.9c4.9,0,9,4,9,9V140.3z" />
			<path style={blockStyle} d="M318.3,231.9c0,4.9-4,9-9,9h-72.9c-4.9,0-9-4.1-9-9v-29c0-4.9,4.1-9,9-9h72.9c5,0,9,4.1,9,9V231.9z" />
			<path style={blockStyle} d="M155,231.9c0,4.9-4,9-9,9H73.1c-5,0-9-4.1-9-9v-29c0-4.9,4-9,9-9H146c5,0,9,4.1,9,9V231.9z" />
			<path style={blockStyle} d="M318.3,48.8c0,5-4,9-9,9h-72.9c-4.9,0-9-4-9-9v-29c0-4.9,4.1-9,9-9h72.9c5,0,9,4.1,9,9V48.8z" />
			<path style={blockStyle} d="M427.2,48.8c0,5-4,9-9,9h-72.9c-5,0-9-4-9-9v-29c0-4.9,4-9,9-9h72.9c5,0,9,4.1,9,9V48.8z" />
			<line style={lineStyle} x1="163.9" y1="102.3" x2="163.9" y2="57.8" />
			<path style={lineStyle} d="M54.9,57.8v13.2c0,4.9,4,9,9,9h75.9c4.9,0,9,4,9,9v13.2" />
			<path style={lineStyle} d="M265.3,57.8v13.2c0,4.9-4.1,9-9,9h-68.4c-4.9,0-9,4-9,9v13.2" />
			<path style={blockStyle} d="M372.6,140.3c0,4.9-4,9-9,9h-72.9c-5,0-9-4.1-9-9v-29c0-5,4-9,9-9h72.9c5,0,9,4,9,9V140.3z" />
			<path style={blockStyle} d="M318.3,323.4c0,5-4,9-9,9h-72.9c-4.9,0-9-4-9-9v-29c0-4.9,4.1-9,9-9h72.9c5,0,9,4.1,9,9V323.4z" />
			<path style={blockStyle} d="M481.6,140.3c0,4.9-4,9-9,9h-72.9c-5,0-9-4.1-9-9v-29c0-5,4-9,9-9h72.9c5,0,9,4,9,9V140.3z" />
			<path style={blockStyle} d="M481.6,231.9c0,4.9-4,9-9,9h-72.9c-5,0-9-4.1-9-9v-29c0-4.9,4-9,9-9h72.9c5,0,9,4.1,9,9V231.9z" />
			<path style={blockStyle} d="M590.5,140.3c0,4.9-4,9-9,9h-72.9c-5,0-9-4.1-9-9v-29c0-5,4-9,9-9h72.9c5,0,9,4,9,9V140.3z" />
			<line style={lineStyle} x1="436.1" y1="193.8" x2="436.1" y2="149.3" />
			<path style={lineStyle} d="M327.2,149.3v13.2c0,5,4.1,9,9,9h75.9c5,0,9,4.1,9,9v13.2" />
			<path style={lineStyle} d="M545.1,149.3v13.2c0,5-4,9-9,9h-75.9c-4.9,0-9,4.1-9,9v13.2" />
			<path style={lineStyle} d="M163.9,149.3v13.2c0,5-4.1,9-9,9H126c-5,0-9,4.1-9,9v13.2" />
			<path style={lineStyle} d="M55.2,149.3v13.2c0,5,4,9,9,9H93c4.9,0,9,4.1,9,9v13.2" />
			<path style={lineStyle} d="M280.3,57.8v13.2c0,4.9,4,9,9,9h21.4c5,0,9,4,9,9v13.2" />
			<path style={lineStyle} d="M381.5,57.8v13.2c0,4.9-4,9-9,9h-28.9c-4.9,0-9,4-9,9v13.2" />
			<line style={lineStyle} x1="272.8" y1="240.9" x2="272.8" y2="285.3" />
			<path style={lineStyle} d="M436.1,240.9v13.2c0,4.9-4,9-9,9H296.8c-5,0-9,4-9,9v13.2" />
			<path style={lineStyle} d="M109.5,240.9v13.2c0,4.9,4,9,9,9h130.3c4.9,0,9,4,9,9v13.2" />
		</SvgPortal>
	</Drawing>
}

function DeficiencyImage() {
	const transformationSettings = useIdentityTransformationSettings(340, 170)
	const lineStyle = { fill: 'none', stroke: '#404040', strokeWidth: '2', strokeMiterlimit: 10 }
	const blockStyle = { fill: lineStyle.stroke }
	const iconStyle = { fill: '#ffffff' }

	return <Drawing transformationSettings={transformationSettings}>
		<SvgPortal>
			<path style={blockStyle} d="M105.8,54c0,5-4.1,9-9,9H23.8c-5,0-9-4-9-9v-29c0-4.9,4-9,9-9h72.9c4.9,0,9,4.1,9,9V54z" />
			<path style={iconStyle} d="M67.2,32.8l-9.9,9.9l-5.4-5.4l-2.1,2.1l7.5,7.5l12-12L67.2,32.8z M60.3,24.4c-8.3,0-15,6.7-15,15s6.7,15,15,15
		s15-6.7,15-15S68.6,24.4,60.3,24.4 M60.3,51.4c-6.6,0-12-5.4-12-12s5.4-12,12-12s12,5.4,12,12S66.9,51.4,60.3,51.4"/>
			<path style={blockStyle} d="M214.7,54c0,5-4.1,9-9,9h-72.9c-5,0-9-4-9-9v-29c0-4.9,4-9,9-9h72.9c4.9,0,9,4.1,9,9V54z" />
			<path style={iconStyle} d="M167.8,43.9h3v3h-3V43.9z M167.8,31.9h3v9h-3V31.9z M169.2,24.4c-8.3,0-15,6.7-15,15s6.7,15,15,15
		c8.3,0,15-6.7,15-15S177.5,24.4,169.2,24.4 M169.3,51.4c-6.6,0-12-5.4-12-12s5.4-12,12-12c6.6,0,12,5.4,12,12
		S175.9,51.4,169.3,51.4"/>
			<path style={blockStyle} d="M214.7,145.5c0,4.9-4.1,9-9,9h-72.9c-5,0-9-4.1-9-9v-29c0-4.9,4-9,9-9h72.9c4.9,0,9,4.1,9,9V145.5z" />
			<path style={iconStyle} d="M167.8,139.9h3v-3h-3V139.9z M169.3,115.9c-8.3,0-15,6.7-15,15s6.7,15,15,15s15-6.7,15-15
		S177.5,115.9,169.3,115.9 M169.3,142.9c-6.6,0-12-5.4-12-12c0-6.6,5.4-12,12-12c6.6,0,12,5.4,12,12
		C181.3,137.6,175.9,142.9,169.3,142.9 M169.3,121.9c-3.3,0-6,2.7-6,6h3c0-1.7,1.3-3,3-3c1.6,0,3,1.3,3,3c0,3-4.5,2.6-4.5,7.5h3
		c0-3.4,4.5-3.8,4.5-7.5C175.3,124.6,172.6,121.9,169.3,121.9"/>
			<path style={blockStyle} d="M323.7,54c0,5-4,9-9,9h-72.9c-5,0-9-4-9-9v-29c0-4.9,4-9,9-9h72.9c5,0,9,4.1,9,9V54z" />
			<path style={iconStyle} d="M285.1,32.8l-9.9,9.9l-5.4-5.4l-2.1,2.1l7.5,7.5l12-12L285.1,32.8z M278.2,24.4c-8.3,0-15,6.7-15,15
		s6.7,15,15,15s15-6.7,15-15S286.5,24.4,278.2,24.4 M278.2,51.4c-6.6,0-12-5.4-12-12s5.4-12,12-12s12,5.4,12,12
		S284.8,51.4,278.2,51.4"/>
			<line style={lineStyle} x1="169.3" y1="107.4" x2="169.3" y2="63" />
			<path style={lineStyle} d="M60.3,63v13.2c0,5,4,9,9,9h75.9c4.9,0,9,4.1,9,9v13.2" />
			<path style={lineStyle} d="M278.2,63v13.2c0,5-4.1,9-9,9h-75.9c-4.9,0-9,4.1-9,9v13.2" />
		</SvgPortal>
	</Drawing>
}
