import React from 'react'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'

import StepExercise from '../types/StepExercise'
import { useSolution } from 'ui/eduTools'
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
					<FloatUnitInput id="hx0" prelabel={<M>h_(x=0) =</M>} label="Specifieke enthalpie (vloeistoflijn)" size="s" />
					<FloatUnitInput id="hx1" prelabel={<M>h_(x=1) =</M>} label="Specifieke enthalpie (damplijn)" size="s" />
					<FloatUnitInput id="sx0" prelabel={<M>s_(x=0) =</M>} label="Specifieke entropie (vloeistoflijn)" size="s" />
					<FloatUnitInput id="sx1" prelabel={<M>s_(x=1) =</M>} label="Specifieke entropie (damplijn)" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { hx0, hx1, sx0, sx1 } = useSolution()
			return <Par>We kunnen in de tabellen opzoeken dat <M>h_(x=0) = {hx0},</M> <M>h_(x=1) = {hx1},</M> <M>s_(x=0) = {sx0},</M> <M>s_(x=1) = {sx1}.</M></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Gegeven de specifieke entropie en de zojuist opgezochte waarden <M>s_(x=0)</M> en <M>s_(x=1),</M> bereken de dampfractie.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="x" prelabel={<M>x =</M>} label="Dampfractie" size="s" validate={FloatUnitInput.validation.any} />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { s, sx0, sx1, x } = useSolution()
			return <Par>We bekijken hoe ver <M>s</M> zit, op het interval van <M>s_(x=0)</M> tot <M>s_(x=1).</M> Dit is op een deel van <BM>x = \frac(s - s_(x=0))(s_(x=1) - s_(x=0)) = \frac({s.float} - {sx0.float})({sx1.float} - {sx0.float}) = {x}.</BM> Dit is ook de dampfractie: het deel van het vloeibare water dat inmiddels in gasvormig stoom is omgezet.</Par>
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
			const { x, hx0, hx1, h } = useSolution()
			return <Par>We weten dat de enthalpie op een deel <M>x</M> zit, van <M>h_(x=0)</M> naar <M>h_(x=1).</M> De enthalpie is dus <BM>h = h_(x=0) + x \left(h_(x=1) - h_(x=0)\right) = {hx0.float} + {x.float} \cdot \left({hx1.float} - {hx0.float}\right) = {h}.</BM> Dit is de specifieke enthalpie die we moesten berekenen.</Par>
		},
	},
]