import React from 'react'

import { Unit } from 'step-wise/inputTypes/Unit'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/FormPart'

import SimpleExercise from '../types/SimpleExercise'
import { useSolution } from '../util/SolutionProvider'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getAllInputFieldsFeedback} />
}

function Problem({ mdot, P }) {
	return <>
		<Par>Een axiale compressor zuigt continu lucht aan om te comprimeren. De compressor comprimeert <M>{mdot}</M> aan lucht en gebruikt hiervoor <M>{P}.</M> Ga ervan uit dat de compressor 100% efficiënt is: alle energie wordt nuttig gebruikt om de lucht te comprimeren. Bereken de specifieke technische arbeid <M>w_t</M> die op de lucht uitgeoefend wordt.</Par>
		<InputSpace>
			<Par><FloatUnitInput id="wt" prelabel={<M>w_t =</M>} label="Specifieke technische arbeid" size="s" positive="true" /></Par>
		</InputSpace>
	</>
}

function Solution() {
	const { mdot, P, wt } = useSolution()
	return <Par>We weten dat <M>w_t</M> de arbeid is die <em>per kilogram</em> op de lucht uitgeoefend wordt. Net zo is <M>P</M> de arbeid die <em>per seconde</em> op de lucht uitgeoefend wordt. Om tussen "per kilogram" en "per seconde" heen en weer te rekenen gebruiken we de massastroom. Oftewel, <BM>P = \dot(m)w_t.</BM> Dit oplossen voor <M>w_t</M> geeft <BM>w_t = \frac(P)(\dot(m)) = \frac{P.float}{mdot.float} = {wt} = {wt.setUnit('kJ/kg')}.</BM> Eventueel hadden we het vermogen in <M>{new Unit('kW')}</M> mogen laten staan om gelijk een antwoord in <M>{new Unit('kJ/kg')}</M> te krijgen.</Par>
}