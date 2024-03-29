import React from 'react'

import { Unit } from 'step-wise/inputTypes'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { SimpleExercise } from 'ui/eduTools'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} />
}

function Problem({ q, Qdot }) {
	return <>
		<Par>Een CV-ketel verwarmt water. De ketel is zo ingesteld dat hij altijd een warmte van <M>{q}</M> aan het water toevoert. Op een gegeven moment is het toegevoerde warmtevermogen <M>{Qdot}.</M> Wat is de massastroom van het water op dat moment?</Par>
		<InputSpace>
			<Par><FloatUnitInput id="mdot" prelabel={<M>\dot(m) =</M>} label="Massastroom water" size="s" positive="true" /></Par>
		</InputSpace>
	</>
}

function Solution({ qs, Qdots, mdot }) {
	return <Par>We weten dat <M>q = {qs}</M> de warmte is die <em>per kilogram</em> water wordt toegevoerd. Net zo is <M>\dot(Q) = {Qdots}</M> de warmte die <em>per seconde</em> op de lucht uitgeoefend wordt. Om tussen "per kilogram" en "per seconde" heen en weer te rekenen gebruiken we de massastroom. Oftewel, <BM>\dot(Q) = \dot(m)q.</BM> Dit oplossen voor <M>\dot(m)</M> geeft <BM>\dot(m) = \frac(\dot(Q))(q) = \frac{Qdots.float}{qs.float} = {mdot}.</BM> Eventueel hadden we hier <M>q</M> en <M>\dot(Q)</M> ook allebei in <M>{new Unit('kJ')}</M> kunnen laten staan, omdat dit dan toch tegen elkaar wegvalt.</Par>
}
