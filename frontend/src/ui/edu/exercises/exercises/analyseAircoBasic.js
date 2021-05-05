import React from 'react'

import { FloatUnit } from 'step-wise/inputTypes/FloatUnit'

import { M } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'

import MollierDiagram from '../../content/diagrams/MollierDiagram'

import StepExercise from '../types/StepExercise'
import { useCorrect } from '../ExerciseContainer'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedback} />
}

const Problem = ({ T1, T3, T4, startRH }) => <>
	<Par>Een airconditioning-systeem krijgt lucht met temperatuur <M>{T1}</M> en relatieve luchtvochtigheid <M>{startRH}</M> binnen. De airco koelt deze lucht eerst af tot <M>{T3}</M> en warmt het vervolgens weer op tot <M>{T4}.</M> Bereken de relatieve luchtvochtigheid waarmee de lucht uit deze airco komt.</Par>
	<MollierDiagram maxWidth="500" />
	<InputSpace>
		<Par>
			<FloatUnitInput id="endRH" prelabel={<M>RV_(uit) =</M>} label="Relatieve luchtvochtigheid" size="s" />
		</Par>
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Bepaal de absolute luchtvochtigheid van de instromende lucht.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="startAH" prelabel={<M>AV_(in) =</M>} label="Absolute luchtvochtigheid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { T1, startRH, startAH } = useCorrect()
			return <Par>Bij een temperatuur van <M>{T1}</M> en een relatieve luchtvochtigheid van <M>{startRH.setUnit('%')}</M> kunnen we opzoeken dat de absolute luchtvochtigheid <M>AH_(in) = {startAH}</M> is.</Par>
		},
	},
	{
		Problem: ({ T3 }) => <>
			<Par>De instromende lucht koelt af tot <M>{T3}</M>. Bepaal de absolute luchtvochtigheid van de lucht op dat moment.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="endAH" prelabel={<M>AV_(tussen) =</M>} label="Absolute luchtvochtigheid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { T3, endAH } = useCorrect()
			return <>
				<Par>Bij het opwarmen/afkoelen van lucht blijft de absolute luchtvochtigheid altijd constant. We gaan vanaf het vorige punt dus verticaal omlaag in het Mollier diagram.</Par>
				<Par>Voordat we de <M>{T3}</M> bereiken komen we echter op de 100% luchtvochtigheidslijn aan. De luchtvochtigheid kan nooit hoger dan 100% worden. Dit betekent dat een deel van de vocht in de lucht gaat condenseren en als druppels naar beneden valt.</Par>
				<Par>Bij het condenseren blijft de relatieve luchtvochtigheid 100%. Als we uiteindelijk de <M>{T3}</M> bereiken, dan kunnen we dus direct de absolute luchtvochtigheid aflezen. Deze is <M>AH_(tussen) = {endAH}.</M> Dit is de hoeveelheid vocht die nog over is in de lucht. De rest is gecondenseerd.</Par>
			</>
		},
	},
	{
		Problem: ({ T4 }) => <>
			<Par>Vervolgens wordt de lucht opgewarmd tot <M>{T4}.</M> Bepaal de relatieve luchtvochtigheid na afloop.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="endRH" prelabel={<M>RV_(uit) =</M>} label="Relatieve luchtvochtigheid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { T4, endRH, endAH } = useCorrect()
			return <Par>Vanaf het vorige punt gaan we recht omhoog, met constante absolute luchtvochtigheid <M>AH = {endAH},</M> tot we de <M>{T4}</M> bereikt hebben. Op dit punt is de relatieve luchtvochtigheid <M>RV_(uit) = {endRH.setUnit('%')}.</M> Dit is de relatieve luchtvochtigheid van de uitstromende lucht. Over het algemeen wordt een relatieve luchtvochtigheid tussen de grofweg <M>{new FloatUnit('45%')}</M> en <M>{new FloatUnit('60%')}</M> als comfortabel beschouwd, dus deze airco lijkt goed afgesteld te zijn.</Par>
		},
	},
]