import React, { useState, useEffect } from 'react'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'

import { usePaths } from 'ui/routing'
import { TranslationSection, Translation } from 'i18n'
import { useGroupExistsQuery } from 'api/group'

const useStyles = makeStyles((theme) => ({
	groupCreation: {
		display: 'flex',
		flexFlow: 'row nowrap',
		justifyContent: 'space-between',
		alignItems: 'stretch',
		margin: '1.8rem 0',

		'@media (max-width: 768px)': {
			flexFlow: 'column nowrap',
		},

		'& > div': {
			borderRadius: '0.6rem',
			margin: '0 0.6rem',
			padding: '1rem 0.6rem',
			textAlign: 'center',
			width: '50%',

			'&:first-child': { marginLeft: '0' },
			'&:last-child': { marginRight: '0' },

			'@media (max-width: 768px)': {
				margin: '0.6rem 0',
				width: '100%',
			},

			'& h1': {
				fontSize: '1.4rem',
				margin: '0 0 0.75rem',
				width: '100%',
			},
			'& > p': {
				fontSize: '1.1rem',
				margin: '0.5rem 0',
			},
			'& button': {
				margin: '0.75rem auto',
			},
			'& .inputContainer': {
				margin: '0.5rem auto',

				'& input': {
					fontSize: '1.5rem',
					letterSpacing: '0.3rem',
					width: '12rem',
				},
			},
		},
	},
}))

export default function GroupCreation() {
	const classes = useStyles()
	return <div className={clsx(classes.groupCreation, 'groupCreation')}>
		<CreateGroup />
		<JoinGroup />
	</div>
}

function CreateGroup() {
	const paths = usePaths()
	const navigate = useNavigate()
	return <TranslationSection entry="createGroup">
		<Paper className="block" elevation={3}>
			<h1><Translation entry="title">New practice group</Translation></h1>
			<p><Translation entry="step1">Create a group code/link.</Translation></p>
			<p><Translation entry="step2">Share it with fellow students.</Translation></p>
			<p><Translation entry="step3">Practice with the same exercises.</Translation></p>
			<Button
				className="createButton"
				variant="contained"
				color="primary"
				onClick={() => navigate(paths.newGroup())}
			><Translation entry="confirmationButton">Create new practice group</Translation></Button>
		</Paper>
	</TranslationSection>
}

function JoinGroup() {
	const paths = usePaths()
	const navigate = useNavigate()

	// Set up a state tracking the input field code and the submitted code.
	const [code, setCode] = useState('')
	const [submittedCode, setSubmittedCode] = useState('')
	const [problem, setProblem] = useState(problems.allOK)

	// If a code has been submitted, check its value.
	const { data, loading } = useGroupExistsQuery(submittedCode, isValidCode(submittedCode))

	// Set up a submission handler.
	const submit = (evt) => {
		evt.preventDefault()

		// Store the submission.
		setSubmittedCode(code)

		// Provide feedback on the submission.
		if (typeof code !== 'string' || code.length === 0)
			return setProblem(problems.allOK)
		if (code.length !== 4)
			return setProblem(problems.wrongLength)
		if (!isValidCode(code))
			return setProblem(problems.invalidFormat)
		if (code !== submittedCode)
			return setProblem(problems.allOK) // A uniqueness check will be performed. For now assume all is OK.
	}

	// When the group code check is done, process the results.
	useEffect(() => {
		if (submittedCode && isValidCode(submittedCode)) {
			if (!loading && data) {
				if (data.groupExists)
					navigate(paths.group({ code: submittedCode })) // Send to verification page.
				else
					setProblem(problems.nonExisting)
			}
		}
	}, [submittedCode, loading, data, navigate, paths])

	// Render the component.
	return <TranslationSection entry="joinGroup">
		<Paper className="block" elevation={3}>
			<h1><Translation entry="title">Join existing group</Translation></h1>
			<p><Translation entry="instruction">Enter an existing group code.</Translation></p>
			<form className="inputContainer" onSubmit={submit}>
				<TextField
					id="code"
					error={code === submittedCode && problem !== problems.allOK}
					className="input"
					label={<Translation entry="fieldLabel">Group code</Translation>}
					variant="outlined"
					placeholder="ABCD"
					value={code}
					onChange={(evt) => setCode(evt.target.value.substring(0, 4).toUpperCase())}
					helperText={code === submittedCode ? helperText[problem] : ''}
				/>
			</form>
			<Button
				className="createButton"
				variant="contained"
				color="primary"
				onClick={submit}
			><Translation entry="confirmationButton">Become a group member</Translation></Button>
		</Paper>
	</TranslationSection>
}

const problems = {
	allOK: 0,
	wrongLength: 1,
	invalidFormat: 2,
	nonExisting: 3,
}
const helperText = {
	0: '',
	1: <Translation entry="feedback.numberOfCharacters">Codes must have four characters.</Translation>,
	2: <Translation entry="feedback.useLettersNumbers">Only use letters/numbers.</Translation>,
	3: <Translation entry="feedback.nonexistingGroup">This group code does not exist.</Translation>,
}

function isValidCode(code) {
	return typeof code === 'string' && code.match(/^[A-Z0-9]{4}$/g)
}
