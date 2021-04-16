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
		<Par>{type === 'heatPump' ? `Een warmtepomp onttrekt warmte uit de buitenlucht en levert deze aan de huiskamer. De warmtepomp` : `Een koelkast onttrekt warmte uit de te koelen ruimte en levert deze af aan de keuken waar hij in staat. De koelkast`} heeft een condensortemperatuur van <M>{Tcond}</M> en een verdampertemperatuur van <M>{Tevap}.</M> De warmtewisselaar van de condensor heeft een temperatuursverschil nodig van <M>{dTwarm}.</M> Bij de verdamper is dit benodigde temperatuursverschil <M>{dTcold}.</M> {type === 'heatPump' ? `Bereken de temperatuur buiten en binnen waarbij de warmtepomp nog net goed werkt.` : `Bereken de temperatuur in de koelkast en in de keuken waarbij de koelkast nog net goed werkt.`}</Par>
		<InputSpace>
			<Par>
				<FloatUnitInput id="Tcold" prelabel={<M>{type === 'heatPump' ? `T_(buiten)` : `T_(koelkast)`}=</M>} label={<span><M>{type === 'heatPump' ? `T_(buiten)` : `T_(koelkast)`}</M></span>} size="s" />
				<FloatUnitInput id="Twarm" prelabel={<M>{type === 'heatPump' ? `T_(binnen)` : `T_(keuken)`}=</M>} label={<span><M>{type === 'heatPump' ? `T_(binnen)` : `T_(keuken)`}</M></span>} size="s" />
			</Par>
		</InputSpace>
	</>
}

function Solution() {
	const { type, Tcold, Twarm, dTcold, dTwarm, Tevap, Tcond } = useCorrect()
	if (type === 'heatPump')
		return <Par>We bekijken eerst het leveren van warmte aan de huiskamer. De huiskamer heeft een temperatuur van <M>{Twarm}.</M> Er wordt warmte geleverd aan de huiskamer, en die warmte komt uit het koudemiddel. Omdat het koudemiddel warmte kwijtraakt, zal het gaan condenseren. We hebben hier dus met de condensor te maken. De temperatuur in deze condensor moet hoger zijn dan de temperatuur in de huiskamer, want alleen dan wordt er warmte overgedragen aan de huiskamer. De temperatuur in de condensor is dus
			<BM>T_c = T_(huis) + \Delta T_c = {Twarm.float} + {dTwarm.float} = {Tcond}.</BM>
			Als tweede bekijken we het onttrekken van warmte aan de buitenlucht. De buitenlucht is <M>{Tcold}.</M> Hieruit wordt warmte onttrokken en aan het koudemiddel overgedragen. Deze warmte zorgt ervoor dat het koudemiddel verdampt, waardoor hier de verdamper moet zitten. Om deze warmteoverdracht mogelijk te maken moet de temperatuur van de verdamper lager zijn dan de temperatuur buiten. Dus geldt
			<BM>T_v = T_(buiten) - \Delta T_v = {Tcold.float} - {dTcold.float} = {Tevap}.</BM>
			De temperaturen in de condensor en de verdamper liggen altijd verder uit elkaar dan de temperaturen van de respectievelijke ruimtes, dus dit klopt.
		</Par>
	return <Par>We bekijken eerst het onttrekken van warmte aan de te koelen ruimte. De binnenkant van de koelkast is <M>{Tcold}.</M> Hieruit wordt warmte onttrokken en aan het koudemiddel overgedragen. Deze warmte zorgt ervoor dat het koudemiddel verdampt, waardoor hier de verdamper moet zitten. Om deze warmteoverdracht mogelijk te maken moet de temperatuur van de verdamper lager zijn dan de temperatuur in de koelkast. Dus geldt
		<BM>T_v = T_(koelkast) - \Delta T_v = {Tcold.float} - {dTcold.float} = {Tevap}.</BM>
			Als tweede bekijken we het lozen van warmte aan de keuken. De keuken heeft een temperatuur van <M>{Twarm}.</M> Er wordt warmte geleverd aan de keuken, en die warmte komt uit het koudemiddel. Omdat het koudemiddel warmte kwijtraakt, zal het gaan condenseren. We hebben hier dus met de condensor te maken. De temperatuur in deze condensor moet hoger zijn dan de temperatuur in de keuken, want alleen dan wordt er warmte overgedragen aan de keuken. De temperatuur in de condensor is dus
			<BM>T_c = T_(keuken) + \Delta T_c = {Twarm.float} + {dTwarm.float} = {Tcond}.</BM>
			De temperaturen in de condensor en de verdamper liggen altijd verder uit elkaar dan de temperaturen van de respectievelijke ruimtes, dus dit klopt.
		</Par>
}

function getFeedback(exerciseData) {
	const { input, state, shared: { getCorrect, data: { equalityOptions } } } = exerciseData
	const { type, Tcold, Twarm, dTcold, dTwarm, Tevap, Tcond } = getCorrect(state)
	const wrong = {
		Tcond: Twarm.subtract(dTwarm),
		Tevap: Tcold.add(dTcold),
	}
	const feedback = {}

	// Have the condensor/evaporator been mixed up?
	if (Tevap.equals(input.Tcond, equalityOptions.default) && Tcond.equals(input.Tevap, equalityOptions.default))
		return {
			Tcond: { correct: false, text: 'Oops ... je hebt de condensor en de verdamper omgewisseld.' },
			Tevap: { correct: false, text: 'Dit is dus de temperatuur in de condensor.' },
		}

	// Has at the condensor the temperature been subtracted?
	if (Tcond.equals(input.Tcond, equalityOptions.default))
		feedback.Tcond = { correct: true, text: selectRandomCorrect() }
	else if (wrong.Tcond.equals(input.Tcond, equalityOptions.default))
		feedback.Tcond = { correct: false, text: `Moet het koudemiddel in de condensor warmer of juist kouder zijn, om warmte aan de ${type === 'heatPump' ? 'woonkamer' : 'keuken'} af te geven?` }
	else if (Tevap.equals(input.Tcond, equalityOptions.default))
		feedback.Tcond = { correct: false, text: `Dit is de temperatuur in de verdamper.` }
	else if (wrong.Tevap.equals(input.Tcond, equalityOptions.default))
		feedback.Tcond = { correct: false, text: 'Je haalt een hoop door elkaar. Waar zit de condensor? En moet het temperatuursverschil erbij of juist eraf?' }
	else
		feedback.Tcond = { correct: false, text: 'Hoe kom je hierop? Het idee is dat je het juiste temperatuursverschil bij de juiste temperatuur optelt/aftrekt. Niets meer.' }

	// Has at the evaporator the temperature been added?
	if (Tevap.equals(input.Tevap, equalityOptions.default))
		feedback.Tevap = { correct: true, text: selectRandomCorrect() }
	else if (wrong.Tevap.equals(input.Tevap))
		feedback.Tevap = { correct: false, text: `Moet het koudemiddel in de verdamper warmer of juist kouder zijn, om warmte aan de ${type === 'heatPump' ? 'buitenlucht' : 'koelruimte'} te onttrekken?` }
	else if (Tcond.equals(input.Tevap, equalityOptions.default))
		feedback.Tevap = { correct: false, text: `Dit is de temperatuur in de condensor.` }
	else if (wrong.Tcond.equals(input.Tevap, equalityOptions.default))
		feedback.Tevap = { correct: false, text: 'Je haalt een hoop door elkaar. Waar zit de verdamper? En moet het temperatuursverschil erbij of juist eraf?' }
	else
		feedback.Tevap = { correct: false, text: 'Hoe kom je hierop? Het idee is dat je het juiste temperatuursverschil bij de juiste temperatuur optelt/aftrekt. Niets meer.' }

	// All done.
	return feedback
}