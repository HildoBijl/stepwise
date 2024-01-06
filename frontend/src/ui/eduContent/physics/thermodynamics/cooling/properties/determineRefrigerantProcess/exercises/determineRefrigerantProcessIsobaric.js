import React from 'react'

import { Par, M } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { SimpleExercise, useSolution } from 'ui/eduTools'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} />
}

function Problem({ refrigerant, phase1, T1, x1, p1, phase2, x2, T2 }) {
	return <>
		<Par>We voeren een proces uit met het koelmiddel {refrigerant}.
			{phase1 === 'vapor' ?
				<> Bij aanvang is dit koelmiddel een natte damp met temperatuur <M>{T1}</M> en dampfractie <M>{x1}.</M> </> :
				<> Bij aanvang is de druk <M>{p1}</M> en de temperatuur <M>{T1}.</M> Het middel is dus {phase1 === 'liquid' ? 'vloeibaar' : 'gasvormig'}. </>}
			{phase2 === 'vapor' ?
				<> Vervolgens zetten we via een isobaar proces het koelmiddel om in een natte damp met dampfractie <M>{x2}.</M> </> :
				<> Vervolgens brengen we via een isobaar proces de temperatuur naar <M>{T2}.</M> Het middel is dan {phase2 === 'liquid' ? 'vloeibaar' : 'gasvormig'}. </>
			}
			Vind voor dit proces de specifieke enthalpie aan het begin en aan het einde.
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
	const { refrigerant, p, phase1, T1, x1, h1, phase2, T2, x2, h2 } = useSolution()
	return <>
		<Par>Deze opgave lossen we op met het log(p)-h diagram van {refrigerant}. We beginnen hierbij uiteraard bij het beginpunt van het proces.
			{phase1 === 'vapor' ?
				<> Omdat het beginpunt een natte damp is kijken we tussen de vloeistoflijn en de damplijn. Bij <M>T_1 = {T1}</M> en <M>x_1 = {x1}</M> vinden we een druk van <M>p_1 = {p}</M> en een enthalpie van <M>h_1 = {h1}.</M> </> :
				<> We kijken bij een druk van <M>p_1 = {p}</M> waar we de isotherme lijn met <M>T_1 = {T1}</M> raken. Dit is bij <M>h_1 = {h1}.</M> </>
			}
		</Par>
		<Par>
			Om bij punt twee te komen, moeten we een isobaar proces volgen. Isobaar betekent constante druk, wat dus een horizontale lijn is.
			{phase2 === 'vapor' ?
				<> We gaan horizontaal naar het punt toe met <M>x_2 = {x2}.</M> </> :
				<> We gaan horizontaal naar het punt toe waar we de isotherme lijn met <M>T_2 = {T2}</M> snijden. </>
			}
			De enthalpie van dit punt is <M>h_2 = {h2}.</M>
		</Par>
	</>
}