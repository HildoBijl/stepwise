import React from 'react'

import { selectRandomCorrect } from 'ui/edu/exercises/feedbackMessages'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'

import SimpleExercise from '../types/SimpleExercise'
import { useSolution } from '../util/SolutionProvider'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ type, TCond, TEvap, dTCold, dTWarm }) {
	return <>
		<Par>{type === 'heatPump' ? `Een warmtepomp onttrekt warmte uit de buitenlucht en levert deze aan de huiskamer. De warmtepomp` : `Een koelkast onttrekt warmte uit de te koelen ruimte en levert deze af aan de keuken waar hij in staat. De koelkast`} heeft een condensortemperatuur van <M>{TCond}</M> en een verdampertemperatuur van <M>{TEvap}.</M> De warmtewisselaar van de condensor heeft minimaal een temperatuursverschil nodig van <M>{dTWarm}.</M> Bij de verdamper is dit minimaal benodigde temperatuursverschil <M>{dTCold}.</M> {type === 'heatPump' ? `Bereken de temperatuur buiten en binnen waarbij de warmtepomp nog net goed werkt.` : `Bereken de temperatuur in de koelkast en in de keuken waarbij de koelkast nog net goed werkt.`}</Par>
		<InputSpace>
			<Par>
				<FloatUnitInput id="TCold" prelabel={<M>{type === 'heatPump' ? `T_(buiten)` : `T_(koelkast)`}=</M>} label={type === 'heatPump' ? 'Temperatuur buiten' : 'Temperatuur in de koelkast'} size="s" />
				<FloatUnitInput id="TWarm" prelabel={<M>{type === 'heatPump' ? `T_(binnen)` : `T_(keuken)`}=</M>} label={type === 'heatPump' ? 'Temperatuur binnen' : 'Temperatuur in de keuken'} size="s" />
			</Par>
		</InputSpace>
	</>
}

function Solution() {
	const { type, TCold, TWarm, dTCold, dTWarm, TEvap, TCond } = useSolution()
	return <Par>We bekijken eerst de condensor. Deze zit op <M>{TCond}.</M> In de condensor gaat er warmte uit het koudemiddel (daarom condenseert het) en deze warmte wordt dus geleverd aan de {type === 'heatPump' ? 'huiskamer' : 'keuken'}. Om deze warmte te kunnen leveren moet deze ruimte dus kouder zijn dan de condensor. Zo vinden we
		<BM>{type === 'heatPump' ? `T_(binnen)` : `T_(keuken)`} = T_c - \Delta T_c = {TCond.float} - {dTWarm.float} = {TWarm}.</BM>
		Vervolgens bekijken we de verdamper. Deze zit op <M>{TEvap}.</M> In de verdamper gaat er warmte in het koudemiddel (daarom verdampt het) en deze warmte wordt dus onttrokken aan de {type === 'heatPump' ? 'buitenlucht' : 'te koelen ruimte'}. Om hier warmte aan te kunnen onttrekken moet de temperatuur in de verdamper kouder zijn. Zo vinden we
		<BM>{type === 'heatPump' ? `T_(buiten)` : `T_(koelkast)`} = T_v + \Delta T_v = {TEvap.float} + {dTCold.float} = {TCold}.</BM>
		De temperaturen in de condensor en de verdamper liggen altijd verder uit elkaar dan de temperaturen van de respectievelijke ruimtes, dus dit klopt.
	</Par>
}

function getFeedback(exerciseData) {
	const { input, state, shared: { getSolution, data: { comparison } } } = exerciseData
	const { type, TCold, TWarm, dTCold, dTWarm, TEvap, TCond } = getSolution(state)
	const wrong = {
		TWarm: TCond.add(dTWarm),
		TCold: TEvap.subtract(dTCold),
	}
	const feedback = {}

	// Have the condensor/evaporator been mixed up?
	if (TCold.equals(input.TWarm, comparison.default) && TWarm.equals(input.TCold, comparison.default))
		return {
			TCold: { correct: false, text: 'Oops ... je hebt de positie van de condensor en de verdamper omgewisseld.' },
			TWarm: { correct: false, text: `Dit is dus de temperatuur van de ${type === 'heatPump' ? 'buitenlucht' : 'koelkast'}.` },
		}

	// Has at the evaporator the temperature been subtracted?
	if (TCold.equals(input.TCold, comparison.default))
		feedback.TCold = { correct: true, text: selectRandomCorrect() }
	else if (wrong.TCold.equals(input.TCold))
		feedback.TCold = { correct: false, text: `Moet het koudemiddel in de verdamper warmer of juist kouder zijn, om warmte aan de ${type === 'heatPump' ? 'buitenlucht' : 'koelruimte'} te onttrekken?` }
	else if (TWarm.equals(input.TCold, comparison.default))
		feedback.TCold = { correct: false, text: `Dit is de temperatuur in de ${type === 'heatPump' ? 'woonkamer' : 'keuken'}.` }
	else if (wrong.TWarm.equals(input.TCold, comparison.default))
		feedback.TCold = { correct: false, text: 'Je haalt een hoop door elkaar. Waar zit de verdamper? En moet het temperatuursverschil erbij of juist eraf?' }
	else
		feedback.TCold = { correct: false, text: 'Hoe kom je hierop? Het idee is dat je het juiste temperatuursverschil bij de juiste temperatuur optelt/aftrekt. Niets meer.' }

	// Has at the condensor the temperature been added?
	if (TWarm.equals(input.TWarm, comparison.default))
		feedback.TWarm = { correct: true, text: selectRandomCorrect() }
	else if (wrong.TWarm.equals(input.TWarm, comparison.default))
		feedback.TWarm = { correct: false, text: `Moet het koudemiddel in de condensor warmer of juist kouder zijn, om warmte aan de ${type === 'heatPump' ? 'woonkamer' : 'keuken'} af te geven?` }
	else if (TCold.equals(input.TWarm, comparison.default))
		feedback.TWarm = { correct: false, text: `Dit is de temperatuur in de ${type === 'heatPump' ? 'buitenlucht' : 'koelkast'}.` }
	else if (wrong.TCold.equals(input.TWarm, comparison.default))
		feedback.TWarm = { correct: false, text: 'Je haalt een hoop door elkaar. Waar zit de condensor? En moet het temperatuursverschil erbij of juist eraf?' }
	else
		feedback.TWarm = { correct: false, text: 'Hoe kom je hierop? Het idee is dat je het juiste temperatuursverschil bij de juiste temperatuur optelt/aftrekt. Niets meer.' }

	// All done.
	return feedback
}