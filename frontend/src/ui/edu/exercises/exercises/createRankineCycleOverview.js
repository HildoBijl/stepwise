import React from 'react'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'

import StepExercise from '../types/StepExercise'
import { useSolution } from '../util/SolutionProvider'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedback} />
}

const Problem = ({ pc, pe, T2 }) => {
	return <>
		<Par>Een stoomturbine gebruikt een Rankine-cyclus. Hierbij wordt het water eerst met een pomp gecomprimeerd naar <M>{pe}</M> (punt 1). De bijbehorende pomparbeid mag worden verwaarloosd. Op deze druk wordt het water verwarmd, verdampt en oververhit tot <M>{T2}</M> (punt 2). Van hieruit gaat de stoom in de turbine. Via isentrope expansie wordt de druk teruggebracht tot <M>{pc}</M> (punt 3). Ten slotte wordt de stoom isobaar gecondenseerd tot water, tot de vloeistoflijn bereikt wordt (punt 4). Vanaf hier begint alles opnieuw. Vind voor deze ideale Rankine-cyclus de specifieke enthalpie van de stoom/het water in elk punt.</Par>
		<InputSpace>
			<Par>
				<FloatUnitInput id="h1" prelabel={<M>h_1 =</M>} label="Specifieke enthalpie in punt 1" size="s" />
				<FloatUnitInput id="h2" prelabel={<M>h_2 =</M>} label="Specifieke enthalpie in punt 2" size="s" />
				<FloatUnitInput id="h3" prelabel={<M>h_3 =</M>} label="Specifieke enthalpie in punt 3" size="s" />
				<FloatUnitInput id="h4" prelabel={<M>h_4 =</M>} label="Specifieke enthalpie in punt 4" size="s" />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: ({ pc }) => <>
			<Par>Het is het handigst om bij punt 4 te beginnen. Dit punt licht op de damplijn bij <M>{pc}.</M> Zoek de specifieke enthalpie op.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="h4" prelabel={<M>h_4 =</M>} label="Specifieke enthalpie in punt 4" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { pc, h4 } = useSolution()
			return <>
				<Par>Op de damplijn bij een druk van <M>{pc}</M> geldt een specifieke enthalpie van <BM>h_4 = h_(x=0) = {h4}.</BM></Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Beredeneer wat de specifieke enthalpie in punt 1 is, gegeven dat de pomparbeid verwaarloosd mag worden.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="h1" prelabel={<M>h_1 =</M>} label="Specifieke enthalpie in punt 1" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { pc, pe, h1 } = useSolution()
			return <Par>De pomp comprimeert het water dan wel van <M>{pc}</M> naar <M>{pe},</M> maar de arbeid hierbij is erg klein. Als we deze arbeid verwaarlozen, dan zegt de eerste hoofdwet <M>\Delta h = q - w_t</M> dat de enthalpie ook niet verandert. Dus geldt <BM>h_1 = h_4 = {h1}.</BM></Par>
		},
	},
	{
		Problem: ({ pe, T2 }) => <>
			<Par>Zoek op wat de enthalpie en entropie van de stoom zijn in punt 2, bij <M>{pe}</M> en <M>{T2}.</M></Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="h2" prelabel={<M>h_2 =</M>} label="Specifieke enthalpie in punt 2" size="s" />
					<FloatUnitInput id="s2" prelabel={<M>s_2 =</M>} label="Specifieke entropie in punt 2" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { pe, T2, h2, s2 } = useSolution()
			return <>
				<Par>We kunnen direct opzoeken dat stoom met een druk van <M>{pe}</M> en een temperatuur van <M>{T2}</M> een specifieke enthalpie heeft van <M>h_2 = {h2}</M> en een specifieke entropie van <M>s_2 = {s2}.</M></Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Beredeneer wat de entropie van de damp is in punt 3.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="s3" prelabel={<M>s_3 =</M>} label="Specifieke entropie in punt 3" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { s3 } = useSolution()
			return <Par>Gegeven is dat de turbine isentropisch werkt. Dat betekent dat de entropie van de stoom niet verandert gedurende dit proces. Hierdoor geldt <BM>s_3 = s_2 = {s3}.</BM></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken de enthalpie van de damp in punt 3.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="h3" prelabel={<M>h_3 =</M>} label="Specifieke enthalpie in punt 3" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { hx0, hx1, sx0, sx1, x3, h3, s3 } = useSolution()
			return <Par>We weten de entropie <M>s_3.</M> Om de bijbehorende enthalpie <M>h_3</M> te vinden hebben we de dampfractie <M>x_3</M> nodig. Deze vinden we via <BM>x_3 = \frac(s_3 - s_(x=0))(s_(x=1) - s_(x=0)) = \frac({s3.float} - {sx0.float})({sx1.float} - {sx0.float}) = {x3.setDecimals(3)}.</BM> Via deze dampfractie kunnen we de enthalpie vinden als <BM>h_3 = h_(x=0) + x \left(h_(x=1) - h_(x=0)\right) = {hx0.float} + {x3.setDecimals(3).float} \cdot \left({hx1.float} - {hx0.float}\right) = {h3}.</BM> Hiermee zijn alle enthalpieën van de cyclus bekend.</Par>
		},
	},
]