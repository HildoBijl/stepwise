import React from 'react'
import { alpha } from '@material-ui/core/styles/colorManipulator'

import { repeatMultidimensional } from 'step-wise/util'

import { Translation } from 'i18n'
import { usePrimaryColor } from 'ui/theme'
import { Head, Par, List, Term, M, BM } from 'ui/components'
import { useIdentityTransformationSettings, Drawing, Rectangle, Element } from 'ui/figures'
import { SkillLink } from 'ui/eduTools'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>We know how to <SkillLink skillId="expandBrackets">expand brackets</SkillLink> like <M>3\left(4x+5\right)</M>. But what do we do if we have a multiplication of brackets with brackets? Like <M>\left(2x+3\right)\left(4x+5\right)</M>? The answer is: we <Term>expand brackets twice</Term>. First we expand one, and then we expand the other.</Par>
		</Translation>

		<Translation entry="rule">
			<Head>The rule</Head>
			<Par>If we have a number multiplication, like for instance <M>\left(2+3\right) \left(4 + 5\right)</M>, then we can visualize this multiplication using blocks.</Par>
			<BlockDrawing useLetters={false} />
			<Par>From this, we see that <M>\left(2 + 3\right) \left(4 + 5\right)</M> can first be rewritten to <M>2\left(4 + 5\right) + 3\left(4 + 5\right)</M> and then to <M>2 \cdot 4 + 2 \cdot 5 + 3 \cdot 4 + 3 \cdot 5</M>. Check for yourself: they all result into <M>45</M>.</Par>
			<Par>This works exactly the same if we have an expression like <M>\left(a + b\right)\left(c + d\right)</M>. Here, <M>a</M>, <M>b</M>, <M>c</M> and <M>d</M> can be any type of expression, like <M>4x</M> or anything similar. We can again visualize this.</Par>
			<BlockDrawing useLetters={true} />
			<Par>From this visualization, we see that we may rewrite <M>\left(a + b\right)\left(c + d\right)</M> to <M>ac + ad + bc + bd</M>. We call this <Term>expanding double brackets</Term>. The accompanying rule is <BM>\left(a + b\right)\left(c + d\right) = ac + ad + bc + bd.</BM> You generally don't need to remember this rule. What you should remember is that you multiply each of the terms from the left brackets (here <M>a</M> and <M>b</M>) with each of the terms from the right brackets (here <M>c</M> and <M>d</M>). If you do this for all combinations of terms, you get the right result.</Par>
		</Translation>

		<Translation entry="steps">
			<Head>The steps</Head>
			<Par>To expand double brackets, like for instance with <M>\left(2x + 3\right) \left(4x + 5\right)</M>, take the following steps.</Par>
			<List items={[
				<><SkillLink skillId="expandBrackets">Expand the left brackets</SkillLink>. (Or identically, you may start with the right set too.) Keep the other brackets as they are, treating them as a single number. For the example, this gives <BM>\left(2x + 3\right) \left(4x + 5\right) = 2x \left(4x + 5\right) + 3\left(4x + 5\right).</BM></>,
				<>Continue by <SkillLink skillId="expandBrackets">expanding the remaining brackets</SkillLink>. For our example, this then gives
					<BM>2x \left(4x + 5\right) + 3\left(4x + 5\right) = 8x^2 + 10x + 12x + 15.</BM>
					Note that we can also use a short-cut by directly multiplying each of the terms of the left brackets with each of the terms of the right brackets.</>,
				<><SkillLink skillId="mergeSimilarTerms">Merge similar terms</SkillLink> - terms that are identical, apart from their number factor - into a single term. In the example, we merge <M>10x</M> and <M>12x</M> together into <M>22x</M>.</>
			]} />
			<Par>The final result <M>8x^2 + 22x + 15</M> is as easy as you can possibly write it.</Par>
		</Translation>
	</>
}

const left = 12
const top = 18
const size = 24
const delta = 5
const a = 2, b = 3, c = 4, d = 5
function BlockDrawing({ useLetters = false }) {
	const primaryColor = usePrimaryColor()
	const rectangleStyle = { fill: alpha(primaryColor, 0.2), stroke: primaryColor, strokeWidth: 2 }
	const transformationSettings = useIdentityTransformationSettings(left + (c + d) * size + delta, top + (a + b) * size)
	return <Drawing transformationSettings={transformationSettings}>
		{repeatMultidimensional([c, a], (x, y) => <Rectangle key={`${x}-${y}`} dimensions={{ start: [left + x * size, top + y * size], vector: [size, size] }} style={rectangleStyle} />).flat()}
		{repeatMultidimensional([c, b], (x, y) => <Rectangle key={`${x}-${y}`} dimensions={{ start: [left + x * size, top + (a + y) * size + delta], vector: [size, size] }} style={rectangleStyle} />).flat()}
		{repeatMultidimensional([d, a], (x, y) => <Rectangle key={`${x}-${y}`} dimensions={{ start: [left + (c + x) * size + delta, top + y * size], vector: [size, size] }} style={rectangleStyle} />).flat()}
		{repeatMultidimensional([d, b], (x, y) => <Rectangle key={`${x}-${y}`} dimensions={{ start: [left + (c + x) * size + delta, top + (a + y) * size + delta], vector: [size, size] }} style={rectangleStyle} />).flat()}
		<Element anchor={[1, 0.5]} position={[left - 6, top + (a / 2) * size]}><M>{useLetters ? 'a' : a}</M></Element>
		<Element anchor={[1, 0.5]} position={[left - 6, top + (a + b / 2) * size]}><M>{useLetters ? 'b' : b}</M></Element>
		<Element anchor={[0.5, 1]} position={[left + (c / 2) * size, top - 1]}><M>{useLetters ? 'c' : c}</M></Element>
		<Element anchor={[0.5, 1]} position={[left + (c + d / 2) * size + delta, top - 1]}><M>{useLetters ? 'd' : d}</M></Element>
	</Drawing>
}
