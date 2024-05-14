import { useEffect, useMemo } from 'react'

import { RBM } from 'ui/components'

import { useInputData } from '../../../Input'

import { getFIFuncs } from './types'
import { matchCharElements } from './support'

// A separate MathWithoutCursor element is used that does not get the cursor. This makes sure it only rerenders on changes in value. It does make sure that the MathWithCursor context knows of all the characters in the equation.
export function MathWithoutCursor({ type, value }) {
	const { inputFieldRef, storeCharElements } = useInputData()

	// Set up the latex and get the corresponding characters.
	const { latex, chars } = useMemo(() => {
		const FI = { type, value }
		const result = getFIFuncs(FI).toLatex(FI)
		if (result.latex.startsWith('\\left('))
			result.latex = `\\,${result.latex}` // Brackets often take too much space, so on a bracket, add extra space.
		return result
	}, [type, value])

	// Whenever the equation changes, trace all characters to update the character elements.
	useEffect(() => {
		const contentsElement = inputFieldRef.current?.contents
		const equationElement = contentsElement.getElementsByClassName('katex-html')[0]
		storeCharElements(matchCharElements(equationElement, chars))
	}, [inputFieldRef, storeCharElements, latex, chars])

	// Render the equation.
	return <RBM>{latex}</RBM>
}
