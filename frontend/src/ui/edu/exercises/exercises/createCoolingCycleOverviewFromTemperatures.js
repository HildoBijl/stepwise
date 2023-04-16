import React from 'react'

import { Par, M } from 'ui/components'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/FormPart'

import StepExercise from '../types/StepExercise'
import { useSolution } from '../util/SolutionProvider'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedback} />
}

const Problem = ({ refrigerant, TCold, TWarm, dTCold, dTWarm, dTSuperheating, dTSubcooling }) => {
	return <>
		<Par>We bekijken een koelmachine die werkt met {refrigerant}. De koelmachine moet een ruimte op een temperatuur houden van <M>{TCold}.</M> De omgevingstemperatuur (waar warmte geloosd wordt) is <M>{TWarm}.</M> In de verdamper is een minimaal temperatuursverschil nodig van <M>{dTCold}</M> en in de condensor is dit benodigde temperatuursverschil <M>{dTWarm}.</M> Tevens vindt er in de koelmachine <M>{dTSuperheating}</M> oververhitting en <M>{dTSubcooling}</M> nakoeling plaats. Bepaal de specifieke enthalpie van het koudemiddel na de verdamper (punt 1), voor de condensor (punt 2), na de condensor (punt 3) en voor de verdamper (punt 4).</Par>
		<InputSpace>
			<Par>
				<FloatUnitInput id="h1" prelabel={<M>h_1 =</M>} label="Specifieke enthalpie in punt 1" size="s" />
				<FloatUnitInput id="h2" prelabel={<M>h_2 =</M>} label="Specifieke enthalpie in punt 2" size="s" />
				<FloatUnitInput id="h3" prelabel={<M>h_3 =</M>} label="Specifieke enthalpie in punt 3" size="s" />
				<FloatUnitInput id="h4" prelabel={<M>h_4 =</M>} label="Specifieke enthalpie in punt 4" size="s" />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => <>
			<Par>Bepaal als eerste de temperatuur van het koudemiddel in de verdamper en de condensor.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="TEvap" prelabel={<M>T_v =</M>} label="Temperatuur in de verdamper" size="s" />
					<FloatUnitInput id="TCond" prelabel={<M>T_c =</M>} label="Temperatuur in de condensor" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { TCold, TWarm, dTCold, dTWarm, TEvap, TCond } = useSolution()
			return <>
				<Par>De verdamper onttrekt warmte uit de te koelen ruimte van <M>{TCold}.</M> De verdamper moet dus kouder zijn om warmte te onttrekken, en wel <M>{dTCold}.</M> Zo vinden we dat de verdamper werkt op <M>T_v = {TEvap}.</M></Par>
				<Par>De condensor loost warmte in de omgeving, die een temperatuur heeft van <M>{TWarm}.</M> De condensor moet dus warmer zijn om warmte te kunnen lozen, en wel <M>{dTWarm}.</M> Zo vinden we dat de condensor werkt op <M>T_c = {TCond}.</M></Par>
			</>
		},
	},
	{
		Problem: ({ dTSuperheating }) => <>
			<Par>Begin bij punt 1. Hier wordt het (kokende) koudemiddel vanaf de verdampertemperatuur verwarmd tot <M>{dTSuperheating}</M> na de damplijn. Bepaal de specifieke enthalpie.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="h1" prelabel={<M>h_1 =</M>} label="Specifieke enthalpie in punt 1" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { pEvap, dTSuperheating, TEvap, T1, h1 } = useSolution()
			return <>
				<Par>Bij een kooktemperatuur van <M>T_v = {TEvap}</M> is de druk <M>p_v = {pEvap}.</M> Op deze hoogte in het diagram lopen we naar rechts (isobare verwarming) tot we de damplijn bereiken. We moeten nu nog <M>{dTSuperheating}</M> oververhitting toepassen. De temperatuur stijgt dan naar <M>T_1 = {T1}.</M> Bij de betreffende isotherme lijn kunnen we aflezen dat de enthalpie <M>h_1 = {h1}</M> is.</Par>
			</>
		},
	},
	{
		Problem: ({ pCond }) => <>
			<Par>Ga door naar punt 2. Hier wordt het koudemiddel isentropisch gecomprimeerd tot de condensordruk. Bepaal de specifieke enthalpie.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="h2" prelabel={<M>h_2 =</M>} label="Specifieke enthalpie in punt 2" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { pCond, TCond, h2, s1 } = useSolution()
			return <Par>De condensor werkt op een temperatuur van <M>T_c = {TCond}.</M> De bijbehorende druk valt af te lezen als <M>p_c = {pCond}.</M> Om van punt 1 naar punt 2 te gaan volgen we de isentropische lijnen tot deze condensordruk. Bij punt 1 geldt <M>s_1 = {s1}.</M> Dit is dus ook voor punt 2 het geval. Als we kijken waar de betreffende isentropische lijn <M>{pCond}</M> snijdt zien we dat dit is bij <M>h_2 = {h2}.</M></Par>
		},
	},
	{
		Problem: ({ dTSubcooling }) => <>
			<Par>Ga verder met punt 3. Hier wordt het koudemiddel isobaar gekoeld tot <M>{dTSubcooling}</M> na de vloeistoflijn. Bepaal de specifieke enthalpie.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="h3" prelabel={<M>h_3 =</M>} label="Specifieke enthalpie in punt 3" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { pCond, dTSubcooling, TCond, T3, h3 } = useSolution()
			return <>
				<Par>Op een druk van <M>p_c = {pCond}</M> is de kooktemperatuur <M>T_c = {TCond}.</M> Op deze hoogte in het diagram lopen we naar links (isobare koeling) tot we de vloeistof bereiken. We moeten nu nog <M>{dTSubcooling}</M> nakoeling toepassen. De temperatuur daalt dan naar <M>T_3 = {T3}.</M> Bij de betreffende isotherme (verticale) lijn kunnen we aflezen dat de enthalpie <M>h_3 = {h3}</M> is.</Par>
			</>
		},
	},
	{
		Problem: ({ pEvap }) => <>
			<Par>Bepaal ten slotte de specifieke enthalpie in punt 4, na expansie tot de verdamperdruk.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="h4" prelabel={<M>h_4 =</M>} label="Specifieke enthalpie in punt 4" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { h4 } = useSolution()
			return <Par>De laatste stap is de smoorklep. Hier wordt het koudemiddel isenthalpisch geëxpandeerd. De enthalpie blijft dus gelijk. Zo vinden we <M>h_4 = h_3 = {h4}.</M> Hiermee is de cyclus rond.</Par>
		},
	},
]