import React from 'react'

import { Unit } from 'step-wise/inputTypes'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { SimpleExercise } from 'ui/eduTools'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} />
}

function Problem({ mdot, P }) {
	return <>
		<Par>Een axiale compressor zuigt continu lucht aan om te comprimeren. De compressor comprimeert <M>{mdot}</M> aan lucht en gebruikt hiervoor <M>{P}.</M> Ga ervan uit dat de compressor 100% efficiënt is: alle energie wordt nuttig gebruikt om de lucht te comprimeren. Bereken de specifieke technische arbeid <M>w_t</M> die op de lucht uitgeoefend wordt.</Par>
		<InputSpace>
			<Par><FloatUnitInput id="wt" prelabel={<M>w_t =</M>} label="Specifieke technische arbeid" size="s" positive="true" /></Par>
		</InputSpace>
	</>
}

function Solution({ mdots, Ps, wt }) {
	return <Par>We weten dat <M>w_t</M> de arbeid is die <em>per kilogram</em> op de lucht uitgeoefend wordt. Net zo is <M>P</M> de arbeid die <em>per seconde</em> op de lucht uitgeoefend wordt. Om tussen "per kilogram" en "per seconde" heen en weer te rekenen gebruiken we de massastroom. Oftewel, <BM>P = \dot(m)w_t.</BM> Dit oplossen voor <M>w_t</M> geeft <BM>w_t = \frac(P)(\dot(m)) = \frac{Ps.float}{mdots.float} = {wt} = {wt.setUnit('kJ/kg')}.</BM> Eventueel hadden we het vermogen in <M>{new Unit('kW')}</M> mogen laten staan om gelijk een antwoord in <M>{new Unit('kJ/kg')}</M> te krijgen.</Par>
}
