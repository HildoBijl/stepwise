import React, { useMemo } from 'react'
import KaTeX from 'katex'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { HorizontalSlider } from './layout'

// Inline math equation.
export function M(props) {
	return <Math displayMode={false} {...props} />
}
M.tag = 'inline-math'
M.translation = false

// Block math equation.
export function BM(props) {
	return (
		<HorizontalSlider sliderInside={true} padding={12}>
			<RBM {...props} />
		</HorizontalSlider>
	)
}
BM.tag = 'block-math'
BM.translation = false

// Raw block math: no horizontal slider around it.
export function RBM(props) {
	return <Math displayMode={true} {...props} />
}

// A list of block math equations.
export function BMList(props) {
	return (
		<HorizontalSlider sliderInside={true} padding={12}>
			{props.children}
		</HorizontalSlider>
	)
}
BMList.tag = 'math-list'
BMList.translation = false

// A list of block math equations.
export function BMPart(props) {
	return RBM(props)
}
BMPart.tag = 'math-list-part'
BMPart.translation = false

export const latexMinus = '−'

// Accolades are useful as variable because you're not allowed to type them in JSX: they have functionalities.
export const la = '{'
export const ra = '}'

// The zero-width space is sometimes used while rendering equations.
export const zeroWidthSpace = String.fromCharCode(8203)
export const zeroWidthSpaceRegExp = new RegExp(zeroWidthSpace, 'g')

const useStyles = makeStyles((theme) => ({
	equation: {
		fontSize: ({ displayMode }) => displayMode ? '1.1em' : '0.95em',
	},
}))

// Math takes an equation content (often LaTeX or an object that can be Texified) and turns it into an equation. It uses memoization to prevent rerendering equations all the time.
function Math({ children, displayMode, className, style }) {
	const classes = useStyles({ displayMode })
	const latex = preprocess(children, true)
	const result = useMemo(() => {
		const html = KaTeX.renderToString(latex, { displayMode, throwOnError: true })
		return <span className={clsx(classes.equation, 'equation', className)} style={style} dangerouslySetInnerHTML={{ __html: html }} />
	}, [classes, latex, displayMode, className, style])
	return result
}

function preprocess(latex, advanced = false) {
	// Merge potential arrays.
	if (Array.isArray(latex))
		latex = latex.map((latex) => preprocess(latex, false)).join('')

	// Turn objects into tex code, if possible.
	if (typeof latex !== 'string')
		latex = '{' + (latex && (latex.tex || latex.toString())) + '}'

	if (advanced) {
		// Escape percentage signs.
		latex = latex.replaceAll('%', '\\%')

		// Precede a left bracket with a negative space since it adds space around it for no good reason.
		latex = latex.replaceAll('\\left(', '\\!\\left(')

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
