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
			<Par>We know how to calculate a multiplication like <M>4 \cdot \left(2+3\right)</M>. But what do we do with something like <M>4x\left(2x+3\right)</M>? The answer is: we can rewrite this by <Term>expanding brackets</Term>.</Par>
		</Translation>

		<Translation entry="rule">
			<Head>The rule</Head>
			<Par>If we have a number multiplication, like for instance <M>4 \cdot \left(2 + 3\right)</M>, then we can visualize this multiplication using blocks.</Par>
			<BlockDrawing useLetters={false} />
			<Par>From this, we see that <M>4 \cdot \left(2 + 3\right)</M> can be rewritten to <M>4 \cdot 2 + 4 \cdot 3</M>. Check for yourself: both result into <M>20</M>.</Par>
			<Par>This works exactly the same if we have an expression like <M>a \left(b + c\right)</M>. Here, <M>a</M>, <M>b</M> and <M>c</M> can be any type of expression, like <M>4x</M> or anything similar. We can again visualize this.</Par>
			<BlockDrawing useLetters={true} />
			<Par>From this visualization, we see that we may rewrite <M>a\left(b + c\right)</M> to <M>ab + ac</M>. We call this <Term>expanding the brackets</Term>. The accompanying rule is <BM>a\left(b + c\right) = ab + ac.</BM> Note that we multiply the factor outside of the brackets (here <M>a</M>) separately with each of the terms inside the brackets (here <M>b</M> and <M>c</M>).</Par>
		</Translation>

		<Translation entry="steps">
			<Head>The steps</Head>
			<Par>To expand brackets, like for instance with <M>4x \left(2x + 3\right)</M>, take the following steps.</Par>
			<List items={[
				<>Multiply the factor outside of the brackets separately with each term inside the brackets. So <M>4x \left(2x + 3\right)</M> becomes <M>4x \cdot 2x + 4x \cdot 3</M>.</>,
				<>For each of the resulting terms, <SkillLink skillId="simplifyNumberProduct">simplify any potential number multiplications</SkillLink>. So <M>4x \cdot 2x</M> becomes <M>8\cdot x \cdot x</M> and <M>4x \cdot 3</M> becomes <M>12x</M>.</>,
				<>Also <SkillLink skillId="rewritePower">merge any multiplications of equal factors into powers</SkillLink>. So <M>8 \cdot x \cdot x</M> becomes <M>8x^2</M>.</>
			]} />
			<Par>The final result <M>8x^2 + 12x</M> is as easy as you can possibly write it.</Par>
		</Translation>
	</>
}

const left = 12
const top = 18
const size = 24
const delta = 5
const a = 4, b = 2, c = 3
function BlockDrawing({ useLetters = false }) {
	const primaryColor = usePrimaryColor()
	const rectangleStyle = { fill: alpha(primaryColor, 0.2), stroke: primaryColor, strokeWidth: 2 }
	const transformationSettings = useIdentityTransformationSettings(left + (b + c) * size + delta, top + a * size)
	return <Drawing transformationSettings={transformationSettings}>
		{repeatMultidimensional([b, a], (x, y) => <Rectangle key={`${x}-${y}`} dimensions={{ start: [left + x * size, top + y * size], vector: [size, size] }} style={rectangleStyle} />).flat()}
		{repeatMultidimensional([c, a], (x, y) => <Rectangle key={`${x}-${y}`} dimensions={{ start: [left + (b + x) * size + delta, top + y * size], vector: [size, size] }} style={rectangleStyle} />).flat()}
		<Element anchor={[1, 0.5]} position={[left - 6, top + (a / 2) * size]}><M>{useLetters ? 'a' : a}</M></Element>
		<Element anchor={[0.5, 1]} position={[left + (b / 2) * size, top - 1]}><M>{useLetters ? 'b' : b}</M></Element>
		<Element anchor={[0.5, 1]} position={[left + (b + c / 2) * size + delta, top - 1]}><M>{useLetters ? 'c' : c}</M></Element>
	</Drawing>
}
