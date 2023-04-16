import React from 'react'

import { Par, M } from 'ui/components'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/FormPart'

import SimpleExercise from '../types/SimpleExercise'
import { useSolution } from '../util/SolutionProvider'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getAllInputFieldsFeedback} />
}

function Problem({ refrigerant, phase1, T1, x1, p1, p2 }) {
	return <>
		<Par>We voeren een proces uit met het koelmiddel {refrigerant}.
			{phase1 === 'vapor' ?
				<> Bij aanvang is dit koelmiddel een natte damp met temperatuur <M>{T1}</M> en dampfractie <M>{x1}.</M> </> :
				<> Bij aanvang is de druk <M>{p1}</M> en de temperatuur <M>{T1}.</M> Het middel is dus {phase1 === 'liquid' ? 'vloeibaar' : 'gasvormig'}. </>}
			Vervolgens brengen we het koelmiddel via een isentroop proces naar <M>{p2}.</M> Vind voor dit proces de specifieke enthalpie aan het begin en aan het einde.
		</Par>
		<InputSpace>
			<Par>
				<FloatUnitInput id="h1" prelabel={<M>h_1 =</M>} label="Specifieke enthalpie" size="s" />
				<FloatUnitInput id="h2" prelabel={<M>h_2 =</M>} label="Specifieke enthalpie" size="s" />
			</Par>
		</InputSpace>
	</>
}

function Solution() {
	const { refrigerant, phase1, p1, T1, x1, h1, s1, p2, h2 } = useSolution()
	return <>
		<Par>Deze opgave lossen we op met het log(p)-h diagram van {refrigerant}. We beginnen hierbij uiteraard bij het beginpunt van het proces.
			{phase1 === 'vapor' ?
				<> Omdat het beginpunt een natte damp is kijken we tussen de vloeistoflijn en de damplijn. Bij <M>T_1 = {T1}</M> en <M>x_1 = {x1}</M> vinden we een druk van <M>p_1 = {p1}</M> en een enthalpie van <M>h_1 = {h1}.</M> </> :
				<> We kijken bij een druk van <M>p_1 = {p1}</M> waar we de isotherme lijn met <M>T_1 = {T1}</M> raken. Dit is bij <M>h_1 = {h1}.</M> </>
			}
		</Par>
		<Par>
			Om bij punt twee te komen, moeten we een isentroop proces volgen. We volgens dus de lijnen met constante entropie <M>s.</M> Deze entropie valt overigens af te lezen als <M>s = {s1}</M> maar deze waarde is niet per se nodig. We hoeven alleen de isentropische lijnen te volgen tot <M>p_2 = {p2},</M> waar we kunnen aflezen dat <M>h_2 = {h2}.</M>
		</Par>
	</>
}