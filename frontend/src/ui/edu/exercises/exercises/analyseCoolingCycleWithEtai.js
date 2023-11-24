import React from 'react'

import { Par, M, BM, BMList, BMPart } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'

import StepExercise from '../types/StepExercise'
import { useSolution } from 'ui/eduTools'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedback} />
}

const Problem = ({ refrigerant, TCold, TWarm, dTCold, dTWarm, dTSuperheating, dTSubcooling, etai, P }) => {
	return <>
		<Par>We bekijken een koelmachine die werkt met {refrigerant}. De koelmachine moet een ruimte op een temperatuur houden van <M>{TCold}.</M> De omgevingstemperatuur (waar warmte geloosd wordt) is <M>{TWarm}.</M> In de verdamper is een minimaal temperatuursverschil nodig van <M>{dTCold}</M> en in de condensor is dit benodigde temperatuursverschil <M>{dTWarm}.</M> Tevens vindt er in de koelmachine <M>{dTSuperheating}</M> oververhitting en <M>{dTSubcooling}</M> nakoeling plaats. De compressor heeft een isentropisch rendement van <M>{etai.setUnit('%')}</M> en gebruikt een vermogen van <M>{P}.</M> Bepaal de koudefactor/warmtefactor en de massastroom koudemiddel die door de koelmachine stroomt.</Par>
		<InputSpace>
			<Par>
				<FloatUnitInput id="epsilon" prelabel={<M>\varepsilon =</M>} label="Koudefactor" size="s" validate={FloatUnitInput.validation.any} />
				<FloatUnitInput id="COP" prelabel={<M>\varepsilon_w =</M>} label="Warmtefactor" size="s" validate={FloatUnitInput.validation.any} />
				<FloatUnitInput id="mdot" prelabel={<M>\dot(m) =</M>} label="Massastroom" size="s" />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => <>
			<Par>Bekijk eerst de ideale cyclus (zonder meenemen van het isentropisch rendement) beschreven door punten <M>1-2'-3-4.</M> Bepaal hiervoor de specifieke enthalpiën.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="h1" prelabel={<M>h_1 =</M>} label="Specifieke enthalpie in punt 1" size="s" />
					<FloatUnitInput id="h2p" prelabel={<M>h_(2') =</M>} label="Specifieke enthalpie in punt 2'" size="s" />
					<FloatUnitInput id="h3" prelabel={<M>h_3 =</M>} label="Specifieke enthalpie in punt 3" size="s" />
					<FloatUnitInput id="h4" prelabel={<M>h_4 =</M>} label="Specifieke enthalpie in punt 4" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { TCold, TWarm, dTCold, dTWarm, TEvap, TCond, pEvap, pCond, dTSuperheating, dTSubcooling, T1, T3, h1, h2p, h3, h4, s1 } = useSolution()
			return <>
				<Par>We vinden eerst de temperaturen in de verdamper en de condensor als
					<BMList>
						<BMPart>T_v = {TCold.float} - {dTCold.float} = {TEvap},</BMPart>
						<BMPart>T_c = {TWarm.float} + {dTWarm.float} = {TCond}.</BMPart>
					</BMList>
					De bijbehorende verdamperdruk en condensordruk zijn op te zoeken als <M>p_v = {pEvap}</M> en <M>p_c = {pCond}.</M>
				</Par>
				<Par>Vervolgens lopen we alle punten door. Om punt <M>1</M> te vinden gaan we op <M>{pEvap}</M> naar rechts tot we <M>{dTSuperheating}</M> voorbij de damplijn zijn. Bij de temperatuur van <M>{T1}</M> vinden we <M>h_1 = {h1}.</M> Voor punt <M>2'</M> volgen we de isentrope lijnen bij <M>s = {s1}</M> tot de druk van <M>{pCond}.</M> Hier zien we dat <M>h_(2') = {h2p}.</M> Voor punt <M>3</M> gaan we naar links tot <M>{dTSubcooling}</M> voorbij de vloeistoflijn. Dit is bij een temperatuur van <M>{T3}</M> en de specifieke enthalpie is hier <M>h_3 = {h3}.</M> Ten slotte is er punt <M>4</M>. Hiervoor gaan we recht omlaag tot <M>{pEvap}.</M> Uiteraard geldt <M>h_4 = h_3 = {h4}.</M> Hiermee is de ideale cyclus rond.</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Gebruik het isentropisch rendement om de werkelijke specifieke enthalpie na de compressor te bepalen.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="h2" prelabel={<M>h_2 =</M>} label="Specifieke enthalpie in punt 2" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { h1, h2p, h2, wt, wtp, etai } = useSolution()
			return <>
				<Par>De specifieke technische arbeid in het isentrope geval is <BM>w_(t') = h_(2') - h_1 = {h2p.float} - {h1.float} = {wtp}.</BM> In werkelijkheid is dit getal groter: vanwege frictie moet de compressor meer arbeid verrichten. De werkelijke arbeid volgt dus als <BM>w_t = \frac(w_(t'))(\eta_i) = \frac{wtp.float}{etai.float} = {wt}.</BM> De specifieke enthalpie in punt <M>2</M> volgt als <BM>h_2 = h_1 + w_t = {h1.float} + {wt.float} = {h2}.</BM> Eventueel had dit ook direct gevonden kunnen worden via <BM>h_2 = h_1 + \frac(h_(2') - h_1)(\eta_i) = {h1.float} + \frac({h2p.float} - {h1.float}){etai.float} = {h2}.</BM></Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken met alle bekende gegevens de koudefactor, de warmtefactor en de massastroom aan koudemiddel.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="epsilon" prelabel={<M>\varepsilon =</M>} label="Koudefactor" size="s" validate={FloatUnitInput.validation.any} />
					<FloatUnitInput id="COP" prelabel={<M>\varepsilon_w =</M>} label="Warmtefactor" size="s" validate={FloatUnitInput.validation.any} />
					<FloatUnitInput id="mdot" prelabel={<M>\dot(m) =</M>} label="Massastroom" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { h1, h2, h3, h4, wt, qin, qout, epsilon, COP, mdot, P } = useSolution()
			return <Par>De toegevoerde en afgevoerde warmte zijn
				<BMList>
					<BMPart>q_(toe) = h_1 - h_4 = {h1.float} - {h4.float} = {qin},</BMPart>
					<BMPart>q_(af) = h_2 - h_3 = {h2.float} - {h3.float} = {qout}.</BMPart>
				</BMList>
				Ook was al bekend dat <M>w_t = {wt}</M> en <M>P = {P}.</M> Hiermee kunnen we alle benodigde waarden direct berekenen. We vinden
				<BMList>
					<BMPart>\epsilon = \frac(q_(in))(w_t) = \frac{qin.float}{wt.float} = {epsilon},</BMPart>
					<BMPart>\epsilon_w = \frac(q_(out))(w_t) = \frac{qout.float}{wt.float} = {COP},</BMPart>
					<BMPart>\dot(m) = \frac(P)(w_t) = \frac{P.float}{wt.float} = {mdot}.</BMPart>
				</BMList>Hiermee zijn all gevraagde waarden gevonden.</Par>
		},
	},
]
