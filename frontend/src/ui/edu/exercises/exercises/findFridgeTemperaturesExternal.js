import React from 'react'

import { selectRandomCorrect } from 'step-wise/util/random'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'

import SimpleExercise from '../types/SimpleExercise'
import { useCorrect } from '../ExerciseContainer'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ type, Tcond, Tevap, dTcold, dTwarm }) {
	return <>
		<Par>{type === 'heatPump' ? `Een warmtepomp onttrekt warmte uit de buitenlucht en levert deze aan de huiskamer. De warmtepomp` : `Een koelkast onttrekt warmte uit de te koelen ruimte en levert deze af aan de keuken waar hij in staat. De koelkast`} heeft een condensortemperatuur van <M>{Tcond}</M> en een verdampertemperatuur van <M>{Tevap}.</M> De warmtewisselaar van de condensor heeft minimaal een temperatuursverschil nodig van <M>{dTwarm}.</M> Bij de verdamper is dit minimaal benodigde temperatuursverschil <M>{dTcold}.</M> {type === 'heatPump' ? `Bereken de temperatuur buiten en binnen waarbij de warmtepomp nog net goed werkt.` : `Bereken de temperatuur in de koelkast en in de keuken waarbij de koelkast nog net goed werkt.`}</Par>
		<InputSpace>
			<Par>
				<FloatUnitInput id="Tcold" prelabel={<M>{type === 'heatPump' ? `T_(buiten)` : `T_(koelkast)`}=</M>} label={type === 'heatPump' ? 'Temperatuur buiten' : 'Temperatuur in de koelkast'} size="s" />
				<FloatUnitInput id="Twarm" prelabel={<M>{type === 'heatPump' ? `T_(binnen)` : `T_(keuken)`}=</M>} label={type === 'heatPump' ? 'Temperatuur binnen' : 'Temperatuur in de keuken'} size="s" />
			</Par>
		</InputSpace>
	</>
}

function Solution() {
	const { type, Tcold, Twarm, dTcold, dTwarm, Tevap, Tcond } = useCorrect()
	return <Par>We bekijken eerst de condensor. Deze zit op <M>{Tcond}.</M> In de condensor gaat er warmte uit het koudemiddel (daarom condenseert het) en deze warmte wordt dus geleverd aan de {type === 'heatPump' ? 'huiskamer' : 'keuken'}. Om deze warmte te kunnen leveren moet deze ruimte dus kouder zijn dan de condensor. Zo vinden we
	<BM>{type === 'heatPump' ? `T_(binnen)` : `T_(keuken)`} = T_c - \Delta T_c = {Tcond.float} - {dTwarm.float} = {Twarm}.</BM>
	Vervolgens bekijken we de verdamper. Deze zit op <M>{Tevap}.</M> In de verdamper gaat er warmte in het koudemiddel (daarom verdampt het) en deze warmte wordt dus onttrokken aan de {type === 'heatPump' ? 'buitenlucht' : 'te koelen ruimte'}. Om hier warmte aan te kunnen onttrekken moet de temperatuur in de verdamper kouder zijn. Zo vinden we
	<BM>{type === 'heatPump' ? `T_(buiten)` : `T_(koelkast)`} = T_v + \Delta T_v = {Tevap.float} + {dTcold.float} = {Tcold}.</BM>
			De temperaturen in de condensor en de verdamper liggen altijd verder uit elkaar dan de temperaturen van de respectievelijke ruimtes, dus dit klopt.
		</Par>
}

function getFeedback(exerciseData) {
	const { input, state, shared: { getCorrect, data: { equalityOptions } } } = exerciseData
	const { type, Tcold, Twarm, dTcold, dTwarm, Tevap, Tcond } = getCorrect(state)
	const wrong = {
		Twarm: Tcond.add(dTwarm),
		Tcold: Tevap.subtract(dTcold),
	}
	const feedback = {}

	// Have the condensor/evaporator been mixed up?
	if (Tcold.equals(input.Twarm, equalityOptions.default) && Twarm.equals(input.Tcold, equalityOptions.default))
		return {
			Tcold: { correct: false, text: 'Oops ... je hebt de positie van de condensor en de verdamper omgewisseld.' },
			Twarm: { correct: false, text: `Dit is dus de temperatuur van de ${type === 'heatPump' ? 'buitenlucht' : 'koelkast'}.` },
		}

	// Has at the evaporator the temperature been subtracted?
	if (Tcold.equals(input.Tcold, equalityOptions.default))
		feedback.Tcold = { correct: true, text: selectRandomCorrect() }
	else if (wrong.Tcold.equals(input.Tcold))
		feedback.Tcold = { correct: false, text: `Moet het koudemiddel in de verdamper warmer of juist kouder zijn, om warmte aan de ${type === 'heatPump' ? 'buitenlucht' : 'koelruimte'} te onttrekken?` }
	else if (Twarm.equals(input.Tcold, equalityOptions.default))
		feedback.Tcold = { correct: false, text: `Dit is de temperatuur in de ${type === 'heatPump' ? 'woonkamer' : 'keuken'}.` }
	else if (wrong.Twarm.equals(input.Tcold, equalityOptions.default))
		feedback.Tcold = { correct: false, text: 'Je haalt een hoop door elkaar. Waar zit de verdamper? En moet het temperatuursverschil erbij of juist eraf?' }
	else
		feedback.Tcold = { correct: false, text: 'Hoe kom je hierop? Het idee is dat je het juiste temperatuursverschil bij de juiste temperatuur optelt/aftrekt. Niets meer.' }

	// Has at the condensor the temperature been added?
	if (Twarm.equals(input.Twarm, equalityOptions.default))
		feedback.Twarm = { correct: true, text: selectRandomCorrect() }
	else if (wrong.Twarm.equals(input.Twarm, equalityOptions.default))
		feedback.Twarm = { correct: false, text: `Moet het koudemiddel in de condensor warmer of juist kouder zijn, om warmte aan de ${type === 'heatPump' ? 'woonkamer' : 'keuken'} af te geven?` }
	else if (Tcold.equals(input.Twarm, equalityOptions.default))
		feedback.Twarm = { correct: false, text: `Dit is de temperatuur in de ${type === 'heatPump' ? 'buitenlucht' : 'koelkast'}.` }
	else if (wrong.Tcold.equals(input.Twarm, equalityOptions.default))
		feedback.Twarm = { correct: false, text: 'Je haalt een hoop door elkaar. Waar zit de condensor? En moet het temperatuursverschil erbij of juist eraf?' }
	else
		feedback.Twarm = { correct: false, text: 'Hoe kom je hierop? Het idee is dat je het juiste temperatuursverschil bij de juiste temperatuur optelt/aftrekt. Niets meer.' }

	// All done.
	return feedback
}