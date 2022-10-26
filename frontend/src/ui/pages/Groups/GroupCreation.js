import React, { useState, useEffect } from 'react'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'

import { usePaths } from 'ui/routing'
import { useGroupExistsQuery, useCreateGroupMutation } from 'api/group'

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
	const [createGroup] = useCreateGroupMutation()
	return <Paper className="block" elevation={3}>
		<h1>Nieuwe samenwerkingsgroep</h1>
		<p>Maak een groepscode/link aan.</p>
		<p>Deel deze met studiegenoten.</p>
		<p>Krijg samen dezelfde opgaven.</p>
		<Button
			className="createButton"
			variant="contained"
			color="primary"
			onClick={createGroup}
		>Maak nieuwe samenwerkingsgroep</Button>
	</Paper>
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
	return <Paper className="block" elevation={3}>
		<h1>Meedoen met bestaande groep</h1>
		<p>Voer een bestaande groepscode in.</p>
		<form className="inputContainer" onSubmit={submit}>
			<TextField
				id="code"
				error={code === submittedCode && problem !== problems.allOK}
				className="input"
				label="Groepscode"
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
		>Word lid van de groep</Button>
	</Paper>
}

const problems = {
	allOK: 0,
	wrongLength: 1,
	invalidFormat: 2,
	nonExisting: 3,
}
const helperText = {
	0: '',
	1: 'Codes hebben altijd vier tekens.',
	2: 'Gebruik alleen letters/cijfers.',
	3: 'De groepscode bestaat niet.',
}

function isValidCode(code) {
	return typeof code === 'string' && code.match(/^[a-zA-Z0-9]{4,4}$/g)
}