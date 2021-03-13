import React from 'react'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput, { validNumberAndUnit } from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'

import StepExercise from '../types/StepExercise'
import { useCorrect } from '../ExerciseContainer'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedback} />
}

const Problem = ({ type, T, p, s }) => <>
	<Par>We bekijken een natte damp op <M>{type === 1 ? T : p}.</M> De specifieke entropie is <M>{s}.</M> Wat is de specifieke enthalpie?</Par>
	<InputSpace>
		<Par>
			<FloatUnitInput id="h" prelabel={<M>h =</M>} label="Specifieke enthalpie" size="s" />
		</Par>
	</InputSpace>
</>

const steps = [
	{
		Problem: ({ type }) => <>
			<Par>Zoek eerst de enthalpie en entropie op, voor de gegeven {type === 1 ? `temperatuur` : `druk`}, bij de vloeistoflijn en damplijn.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="h0" prelabel={<M>h_(x=0) =</M>} label="Specifieke enthalpie (vloeistoflijn)" size="s" />
					<FloatUnitInput id="h1" prelabel={<M>h_(x=1) =</M>} label="Specifieke enthalpie (damplijn)" size="s" />
					<FloatUnitInput id="s0" prelabel={<M>s_(x=0) =</M>} label="Specifieke entropie (vloeistoflijn)" size="s" />
					<FloatUnitInput id="s1" prelabel={<M>s_(x=1) =</M>} label="Specifieke entropie (damplijn)" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { h0, h1, s0, s1 } = useCorrect()
			return <Par>We kunnen in de tabellen opzoeken dat <M>h_(x=0) = {h0},</M> <M>h_(x=1) = {h1},</M> <M>s_(x=0) = {s0},</M> <M>s_(x=1) = {s1}.</M></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Gegeven de specifieke entropie en de zojuist opgezochte waarden <M>s_(x=0)</M> en <M>s_(x=1),</M> bereken de dampfractie.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="x" prelabel={<M>x =</M>} label="Dampfractie" size="s" validate={validNumberAndUnit} />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { s, s0, s1, x } = useCorrect()
			return <Par>We bekijken hoe ver <M>s</M> zit, op het interval van <M>s_(x=0)</M> tot <M>s_(x=1).</M> Dit is op een deel van <BM>x = \frac(s - s_(x=0))(s_(x=1) - s_(x=0)) = \frac({s.float} - {s0.float})({s1.float} - {s0.float}) = {x}.</BM> Dit is ook de dampfractie: het deel van het vloeibare water wat inmiddels in gasvormig stoom is omgezet.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Gegeven de dampfractie en de zojuist opgezochte waarden <M>h_(x=0)</M> en <M>h_(x=1),</M> bereken de specifieke enthalpie.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="h" prelabel={<M>h =</M>} label="Specifieke enthalpie" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { x, h0, h1, h } = useCorrect()
			return <Par>We weten dat de enthalpie op een deel <M>x</M> zit, van <M>h_(x=0)</M> naar <M>h_(x=1).</M> De enthalpie is dus <BM>h = h_(x=0) + x \left(h_(x=1) - h_(x=0)\right) = {h0.float} + {x.float} \cdot \left({h1.float} - {h0.float}\right) = {h}.</BM> Dit is de specifieke enthalpie die we moesten berekenen.</Par>
		},
	},
]