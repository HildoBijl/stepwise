import { Fragment } from 'react'
import { alpha } from '@mui/material'

import { repeat, binomial } from 'step-wise/util'
import { Vector } from 'step-wise/geometry'

import { Translation, useTextTranslation } from 'i18n'
import { usePrimaryColor } from 'ui/theme'
import { Head, Par, List, Term, M, BM, BMList, BMPart } from 'ui/components'
import { useIdentityTransformationSettings, Drawing, Circle, Rectangle, Polygon, Element } from 'ui/figures'
import { SkillLink } from 'ui/eduTools'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>Suppose that we encounter an expression like <M>\left(2x + 3\right)^3</M>. We could once more <Term>expand the brackets</Term> for this. Let's take a look at how it works.</Par>
		</Translation>

		<Translation entry="idea">
			<Head>The round-about method</Head>
			<Par>First we will examine the long method of expanding the brackets. We usually would not use this method in practice because we'll get very big expressions. We will still do so here anyway, just to show you what it entails. So bear with us. We will make it easier later.</Par>
			<Par>In this long method, we write the power out fully as
				<BM>\left(2x + 3\right)^3 = \left(2x + 3\right) \cdot \left(2x + 3\right) \cdot \left(2x + 3\right).</BM>
				Next, we can start expanding brackets. First we expand the brackets on the left. This results in
				<BM>\left(2x + 3\right)^3 = 2x \cdot \left(2x + 3\right) \cdot \left(2x + 3\right) + 3 \cdot \left(2x + 3\right) \cdot \left(2x + 3\right).</BM>
				We then expand the second set of brackets for each term. This results in
				<BM>\left(2x + 3\right)^3 = 2x \cdot 2x \cdot \left(2x + 3\right) + 2x \cdot 3 \cdot \left(2x + 3\right) + 3 \cdot 2x \cdot \left(2x + 3\right) + 3 \cdot 3 \cdot \left(2x + 3\right).</BM>
				If we then also expand the last brackets everywhere, we get
				<BM>\left(2x + 3\right)^3 = 2x \cdot 2x \cdot 2x + 2x \cdot 2x \cdot 3 + 2x \cdot 3 \cdot 2x + 2x \cdot 3 \cdot 3 + 3 \cdot 2x \cdot 2x + 3 \cdot 2x \cdot 3 + 3 \cdot 3 \cdot 2x + 3 \cdot 3 \cdot 3.</BM>
				Note that every possible combination of the factors <M>2x</M> and <M>3</M> is in there. This means that the resulting expression is huge. Luckily, we can simplify it a lot.</Par>
			<Par>First we can simplify all individual terms to get
				<BM>\left(2x + 3\right)^3 = 8x^3 + 12x^2 + 12x^2 + 18x + 12x^2 + 18x + 18x + 27.</BM>
				Now we see that some terms appear multiple times. Specifically, we have three times the term <M>12x^2</M> and three times the term <M>18x</M>. We can simplify this as well! This gives us the final result
				<BM>\left(2x + 3\right)^3 = 8x^3 + 3 \cdot 12x^2 + 3 \cdot 18x + 27 = 8x^3 + 36x^2 + 54x + 81.</BM>
				It was a lot of work, but we got to the final result.
			</Par>
		</Translation>

		<Translation entry="visualization">
			<Head>Making sense of the outcome</Head>
			<Par>The outcome may seem confusing and overly large. However, there is a reason why it is set up the way it is. To grasp this, it helps to visualize it. In geometry, a square or second power like <M>\left(2x+3\right)^2</M> calculates an area.</Par>
			<SquareVisualization />
			<Par>The square <M>\left(2x+3\right)^2</M> represents the entire area, but we can also split it up into smaller areas. If we expand brackets, then we get the expression <M>\left(2x\right)^2 + 2 \cdot 2x \cdot 3 + 3^2</M>. Here every term represents a smaller area.</Par>
			<Par>We can do the same for a cube/third power like <M>\left(2x+3\right)^3</M> which represents a volume.</Par>
			<CubeVisualization />
			<Par>Here <M>\left(2x + 3\right)^3</M> represents the full volume of the cube, but we can also split it up into smaller blocks. These blocks represent the individual terms in <M>8x^3 + 3 \cdot 12x^2 + 3 \cdot 18x + 27</M>. Specifically, we have one large cube for <M>\left(2x\right)^3</M>, three square-like blocks for <M>\left(2x\right)^2 \cdot 3</M>, three rectangular blocks for <M>\left(2x\right) \cdot 3^2</M>, and one small cube for <M>3^3</M>.</Par>
		</Translation>

		<Translation entry="shortcut">
			<Head>The short-cut</Head>
			<Par>The above method is a lot of work, and even more so when the exponent becomes bigger. So let's study a short-cut.</Par>
			<Par>First we want to find the terms that will appear in the final expansion. Effectively, these are the blocks from the above cube. These are
				<BMList>
					<BMPart>\left(2x\right)^3 \cdot 3^0 = 8x^3 \cdot 1 = 8x^3,</BMPart>
					<BMPart>\left(2x\right)^2 \cdot 3^1 = 4x^2 \cdot 3 = 12x^2,</BMPart>
					<BMPart>\left(2x\right)^1 \cdot 3^2 = 2x \cdot 9 = 18x,</BMPart>
					<BMPart>\left(2x\right)^0 \cdot 3^3 = 1 \cdot 27 = 27.</BMPart>
				</BMList>
				Note that we take a power of the first term <M>2x</M> and a power of the second term <M>3</M>, making sure that both exponents add up to <M>3</M> (the exponent we originally started off with), and subsequently multiply these two powers.</Par>
			<Par>Next, we want to determine how often each of these terms will appear in the final expansion. So effectively how often each block appears in the cube. For our example, the terms appeared respectively, one, three, three and one time(s). These numbers may seem familiar if you're familiar with Pascal's triangle. <Term>Pascal's triangle</Term> is a triangle of numbers where every number is the sum of the two numbers diagonally above it.</Par>
			<PascalsTriangle />
			<Par>Note row number three. It is exactly the number of times that each of our terms appeared in the final result! So if we want to know how many times a certain term appears in the final result, we look up the row corresponding to the original exponent (for us <M>3</M>) from Pascal's triangle.</Par>
			<Par>We use the numbers from Pascal's triangle as multiplication factors for each of our terms. If we do so for our example, we get the terms
				<BMList>
					<BMPart>8x^3 \cdot 1 = 8x^3,</BMPart>
					<BMPart>12x^2 \cdot 3 = 36x^2,</BMPart>
					<BMPart>18x \cdot 3 = 54x,</BMPart>
					<BMPart>27 \cdot 1 = 27.</BMPart>
				</BMList>
				Finally we add up all the resulting terms. This gives us the final result
				<BM>\left(2x + 3\right)^3 = 8x^3 + 36x^2 + 54x + 27.</BM>
				So the key is to first calculate the terms that will appear in the final expansion, find out how often they occur using Pascal's triangle, and then assemble the final result accordingly. Especially when the power gets big, this method will save you a lot of work compared to the alternative of expanding every individual set of brackets.
			</Par>
		</Translation>

		<Translation entry="steps">
			<Head>The steps</Head>
			<Par>To expand brackets for a power of a sum, like for instance with <M>\left(2x + 3\right)^3</M>, take the following steps.</Par>
			<List items={[
				<>Find all terms that will appear in the final expansion by taking the two original terms, <SkillLink skillId="simplifyProductOfPowers">calculating their various powers</SkillLink>, and multiplying the outcomes in the right way. That is, the two exponents of the two terms should always add up to the original exponent. For the example, we write down <M>\left(2x\right)^3 \cdot 3^0 = 8x^3</M>, <M>\left(2x\right)^2 \cdot 3^1 = 12x^2</M>, <M>\left(2x\right)^1 \cdot 3^2 = 18x</M> and <M>\left(2x\right)^0 \cdot 3^3 = 27</M>. Note that the exponents always add up to <M>3</M>.</>,
				<>Look up the coefficients in Pascal's triangle, in the row whose number equals the original exponent. For the example, we look up row three to find the coefficients <M>1</M>, <M>3</M>, <M>3</M> and <M>1</M>.</>,
				<>Multiply each term by its respective coefficient and <SkillLink skillId="simplifyNumberProduct">simplify the results</SkillLink>. In the example we get <M>8x^3</M>, <M>36x^2</M>, <M>54x</M> and <M>27</M>.</>,
				<>Add up all the terms to get the final result. So we get <M>\left(2x + 3\right)^3 = 8x^3 + 36x^2 + 54x + 27</M>.</>,
			]} />
		</Translation>
	</>
}

const w = 200 // The width of the square.
const f = 2 / 3 // The factor to split the square width.
const offset = 20 // The margin needed for the labels.
function SquareVisualization() {
	const primaryColor = usePrimaryColor()
	const transformationSettings = useIdentityTransformationSettings(w + offset, w + offset)
	return <Drawing transformationSettings={transformationSettings}>
		{/* Rectangles. */}
		<Rectangle dimensions={{ start: [offset, 0], end: [offset + w * f, w * (1 - f)] }} style={{ fill: alpha(primaryColor, 0.2), stroke: primaryColor }} />
		<Rectangle dimensions={{ start: [offset + w * f, 0], end: [offset + w, w * (1 - f)] }} style={{ fill: alpha(primaryColor, 0.3), stroke: primaryColor }} />
		<Rectangle dimensions={{ start: [offset, w * (1 - f)], end: [offset + w * f, w] }} style={{ fill: alpha(primaryColor, 0.1), stroke: primaryColor }} />
		<Rectangle dimensions={{ start: [offset + w * f, w * (1 - f)], end: [offset + w, w] }} style={{ fill: alpha(primaryColor, 0.2), stroke: primaryColor }} />

		{/* Labels left/below the square. */}
		<Element anchor={[1, 0.5]} position={[offset - 5, w * (1 - f) / 2]}><M>3</M></Element>
		<Element anchor={[1, 0.5]} position={[offset - 5, w * (1 - f) + w * f / 2]}><M>2x</M></Element>
		<Element anchor={[0.5, 0]} position={[offset + w * f / 2, w + 3]}><M>2x</M></Element>
		<Element anchor={[0.5, 0]} position={[offset + w * f + w * (1 - f) / 2, w + 3]}><M>3</M></Element>

		{/* Labels inside the square. */}
		<Element position={[offset + w * f / 2, w * (1 - f) / 2]}><M>2x \cdot 3</M></Element>
		<Element position={[offset + w * f + w * (1 - f) / 2, w * (1 - f) / 2]}><M>3^2</M></Element>
		<Element position={[offset + w * f / 2, w * (1 - f) + w * f / 2]}><M>\left(2x\right)^2</M></Element>
		<Element position={[offset + w * f + w * (1 - f) / 2, w * (1 - f) + w * f / 2]}><M>2x \cdot 3</M></Element>
	</Drawing>
}

const df = 0.4 // How much are things scaled down when going into depth.
const center = new Vector(offset + w, w * df)
const left = center.add([-w, 0])
const bottom = center.add([0, w])
const topRight = center.add([w * df, -w * df])
const bottomLeft = center.add([-w, w])
const right = bottom.add([w * df, -w * df])
const top = left.add([w * df, -w * df])
const frontCenter = bottomLeft.interpolate(center, f)
const topCenter = left.interpolate(topRight, f)
const rightCenter = bottom.interpolate(topRight, f)
function CubeVisualization() {
	const primaryColor = usePrimaryColor()
	const transformationSettings = useIdentityTransformationSettings(w + w * df + offset, w + w * df + offset)

	return <Drawing transformationSettings={transformationSettings}>
		{/* Front rectangles. */}
		<Rectangle dimensions={{ start: bottomLeft, end: frontCenter }} style={{ fill: alpha(primaryColor, 0.1), stroke: primaryColor }} />
		<Rectangle dimensions={{ start: left, end: frontCenter }} style={{ fill: alpha(primaryColor, 0.2), stroke: primaryColor }} />
		<Rectangle dimensions={{ start: bottom, end: frontCenter }} style={{ fill: alpha(primaryColor, 0.2), stroke: primaryColor }} />
		<Rectangle dimensions={{ start: center, end: frontCenter }} style={{ fill: alpha(primaryColor, 0.3), stroke: primaryColor }} />

		{/* Top shapes. */}
		<Polygon points={[left, left.interpolate(top, f), topCenter, left.interpolate(center, f)]} style={{ fill: alpha(primaryColor, 0.2), stroke: primaryColor }}></Polygon>
		<Polygon points={[top, left.interpolate(top, f), topCenter, top.interpolate(topRight, f)]} style={{ fill: alpha(primaryColor, 0.3), stroke: primaryColor }}></Polygon>
		<Polygon points={[center, left.interpolate(center, f), topCenter, center.interpolate(topRight, f)]} style={{ fill: alpha(primaryColor, 0.3), stroke: primaryColor }}></Polygon>
		<Polygon points={[topCenter, top.interpolate(topRight, f), topRight, center.interpolate(topRight, f)]} style={{ fill: alpha(primaryColor, 0.4), stroke: primaryColor }}></Polygon>

		{/* Right shapes. */}
		<Polygon points={[bottom, bottom.interpolate(center, f), rightCenter, bottom.interpolate(right, f)]} style={{ fill: alpha(primaryColor, 0.2), stroke: primaryColor }}></Polygon>
		<Polygon points={[center, bottom.interpolate(center, f), rightCenter, center.interpolate(topRight, f)]} style={{ fill: alpha(primaryColor, 0.3), stroke: primaryColor }}></Polygon>
		<Polygon points={[right, bottom.interpolate(right, f), rightCenter, right.interpolate(topRight, f)]} style={{ fill: alpha(primaryColor, 0.3), stroke: primaryColor }}></Polygon>
		<Polygon points={[topRight, center.interpolate(topRight, f), rightCenter, right.interpolate(topRight, f)]} style={{ fill: alpha(primaryColor, 0.4), stroke: primaryColor }}></Polygon>

		{/* Outside labels. */}
		<Element anchor={[1, 0.5]} position={[bottomLeft.interpolate(left, f / 2).add([-5, 0])]}><M>2x</M></Element>
		<Element anchor={[1, 0.5]} position={[bottomLeft.interpolate(left, f + (1 - f) / 2).add([-5, 0])]}><M>3</M></Element>
		<Element anchor={[0.5, 0]} position={[bottomLeft.interpolate(bottom, f / 2).add([0, 3])]}><M>2x</M></Element>
		<Element anchor={[0.5, 0]} position={[bottomLeft.interpolate(bottom, f + (1 - f) / 2).add([0, 3])]}><M>3</M></Element>
		<Element anchor={[0, 0]} position={[bottom.interpolate(right, f / 2).add([4, 0])]}><M>2x</M></Element>
		<Element anchor={[0, 0]} position={[bottom.interpolate(right, f + (1 - f) / 2).add([4, 0])]}><M>3</M></Element>

		{/* Front labels. */}
		<Element position={frontCenter.interpolate(bottomLeft)}><M>\left(2x\right)^3</M></Element>
		<Element position={frontCenter.interpolate(left)}><M>\left(2x\right)^2 \cdot 3</M></Element>
		<Element position={frontCenter.interpolate(bottom)}><M>\left(2x\right)^2 \cdot 3</M></Element>
		<Element position={frontCenter.interpolate(center)}><M>2x \cdot 3^2</M></Element>

		{/* Top labels. */}
		<Element position={topCenter.interpolate(top).add([0, 1])}><M>2x \cdot 3^2</M></Element>
		<Element position={topCenter.interpolate(topRight).add([2, 1])}><M>3^3</M></Element>

		{/* Right labels. */}
		<Element position={rightCenter.interpolate(right)} rotate={Math.PI / 2}><M>2x \cdot 3^2</M></Element>
	</Drawing>
}

const n = 6 // How many rows to make?
const colWidth = 36
const rowHeight = 28
const circleRadius = rowHeight / 2
const indexWidth = 60
const width = (n + 1) * colWidth + indexWidth
const height = (n + 1) * rowHeight
function PascalsTriangle() {
	const primaryColor = usePrimaryColor()
	const transformationSettings = useIdentityTransformationSettings(width, height)
	const rowText = useTextTranslation('Row', 'PascalsTriangleRow')
	return <Drawing transformationSettings={transformationSettings}>
		{repeat(n + 1, rowIndex => <Fragment key={rowIndex}>
			{/* Row number. */}
			<Element position={[indexWidth - 16, (rowIndex + 0.5) * rowHeight - 1]} anchor={[1, 0.5]}><strong>{rowText} {rowIndex}:</strong></Element>

			{/* Row digits. */}
			{repeat(rowIndex + 1, colIndex => {
				const position = [indexWidth + ((n + 1) / 2 - rowIndex / 2 + colIndex) * colWidth, (rowIndex + 0.5) * rowHeight]
				return <Fragment key={colIndex}>
					<Circle center={position} radius={circleRadius} style={{ fill: primaryColor, opacity: 0.1 }} />
					<Element position={position}><M>{binomial(rowIndex, colIndex)}</M></Element>
				</Fragment>
			})}
		</Fragment>)}
	</Drawing>
}
