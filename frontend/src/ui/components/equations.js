import React from 'react'
import KaTeX from 'katex'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import HorizontalSlider from 'ui/components/layout/HorizontalSlider'

// Inline math equation.
export function M(props) {
	return <Math displayMode={false} {...props} />
}

// Block math equation.
export function BM(props) {
	return (
		<HorizontalSlider sliderInside={true} padding={12}>
			<Math displayMode={true} {...props} />
		</HorizontalSlider>
	)
}

// Raw block math: no horizontal slider around it.
export function RBM(props) {
	return <Math displayMode={true} {...props} />
}

const latexMinus = '−'
export { latexMinus }

// Accolades are useful as variable because you're not allowed to type them in JSX: they have functionalities.
const la = '{'
const ra = '}'
export { la, ra }

// The zero-width space is sometimes used while rendering equations.
const zeroWidthSpace = String.fromCharCode(8203)
export { zeroWidthSpace }

// This is the decimal separator we use site-wide.
const decimalSeparator = ','
export { decimalSeparator }

const useStyles = makeStyles((theme) => ({
	equation: {
		fontSize: ({ displayMode }) => displayMode ? '1em' : '0.9em',
	},
}))

function Math({ children, displayMode }) {
	const classes = useStyles({ displayMode })
	const latex = preprocess(children, true)
	const html = KaTeX.renderToString(latex, { displayMode, throwOnError: true })
	return <span className={clsx(classes.equation, 'equation')} dangerouslySetInnerHTML={{ __html: html }} />
}

function preprocess(latex, advanced = false) {
	// Merge potential arrays.
	if (Array.isArray(latex))
		latex = latex.map((latex) => preprocess(latex, false)).join('')

	// Turn objects into tex code, if possible.
	if (typeof latex !== 'string')
		latex = '{' + (latex && (latex.tex || latex.toString())) + '}'

	if (advanced) {
		// Prevent Latex from messing up commas.
		const replacement = decimalSeparator === ',' ? '{,}' : decimalSeparator

		// Replace a period/comma by the default decimal separator, but only when not preceded by \left or \right or \ (a backslash itself).
		latex = latex.replace(/(?<!(\\left)|(\\right)|(\\))[.,]/g, substr => substr.replace('.', replacement).replace(',', replacement))
		latex = latex.replaceAll('\\.', '.') // Remove backslashes from escaped periods.

		// Escape percentage signs.
		latex = latex.replace('%', '\\%')

		// Replace brackets without \left or \right by accolades, since we cannot use accolades in JSX. Only do this in the end.
		latex = bracketsToAccolades(latex)
	}

	// All done!
	return latex
}

function bracketsToAccolades(latex) {
	// Walk through the string, adding up bracket counters as we go.
	let nextOpening = nextBracket(latex, 0, true) // The position of the next opening bracket.
	let nextClosing = nextBracket(latex, 0, false) // The position of the next closing bracket.
	let result = ''
	let bracketDepth = 0
	let lastOpening = -1
	let lastClosing = -1
	while (nextOpening !== -1 || nextClosing !== -1) {
		// Check if there are too many closing brackets.
		if (bracketDepth < 0)
			throw new Error(`LaTeX error: brackets did not match out. There is a closing bracket without a corresponding opening bracket. Check the LaTeX code "${latex}".`)

		// Check what is the next bracket: opening or closing.
		if (nextOpening !== -1 && nextOpening < nextClosing) {
			if (bracketDepth === 0)
				lastOpening = nextOpening // Remember the position of this bracket.
			bracketDepth++
			nextOpening = nextBracket(latex, nextOpening + 1, true)
		} else {
			bracketDepth--
			if (bracketDepth === 0) {
				result += latex.slice(lastClosing + 1, lastOpening) + '{' + bracketsToAccolades(latex.slice(lastOpening + 1, nextClosing)) + '}' // Add text preceding the brackets and parse text inside the brackets.
				lastClosing = nextClosing // Remember the position of this closing bracket.
			}
			nextClosing = nextBracket(latex, nextClosing + 1, false)
		}
	}

	// Check if there are too many opening brackets.
	if (bracketDepth > 0)
		throw new Error(`LaTeX error: brackets did not match out. There is an opening bracket without a corresponding closing bracket. Check the LaTeX code "${latex}".`)

	// Add the final text and return the result.
	result += latex.slice(lastClosing + 1)
	return result
}

function nextBracket(latex, searchFrom, opening) {
	// Find the index of the next bracket.
	const nextIndex = latex.indexOf(opening ? '(' : ')', searchFrom)

	// Preceded by the precursor? Then keep on looking.
	const precursor = opening ? '\\left' : '\\right'
	if (nextIndex >= precursor.length && latex.slice(nextIndex - precursor.length, nextIndex) === precursor)
		return nextBracket(latex, nextIndex + 1, opening)

	// All good. Return the result.
	return nextIndex
}