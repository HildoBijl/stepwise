import React from 'react'

import { Par, M, BMList, BMPart } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { StepExercise } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} />
}

const Problem = ({ refrigerant, pEvap, pCond, dTSuperheating, dTSubcooling, T2, mdot }) => {
	return <>
		<Par>We bekijken een koelmachine die werkt met {refrigerant}. In de verdamper is de druk <M>{pEvap}</M> en in de condensor is deze <M>{pCond}.</M> De koelmachine past <M>{dTSuperheating}</M> oververhitting en <M>{dTSubcooling}</M> nakoeling toe. Verder is bekend dat de massastroom koudemiddel <M>{mdot}</M> is en dat de temperatuur ervan na de compressor <M>{T2}</M> is. Bepaal de koudefactor/warmtefactor van de koelmachine, en het isentropisch rendement en elektrisch vermogen van de compressor.</Par>
		<InputSpace>
			<Par>
				<FloatUnitInput id="epsilon" prelabel={<M>\varepsilon =</M>} label="Koudefactor" size="s" validate={FloatUnitInput.validation.any} />
				<FloatUnitInput id="COP" prelabel={<M>\varepsilon_w =</M>} label="Warmtefactor" size="s" validate={FloatUnitInput.validation.any} />
				<FloatUnitInput id="etai" prelabel={<M>\eta_i =</M>} label="Isentropisch rendement" size="s" validate={FloatUnitInput.validation.any} />
				<FloatUnitInput id="P" prelabel={<M>P =</M>} label="Compressorvermogen" size="s" />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => <>
			<Par>Bekijk eerst de ideale cyclus (zonder meenemen van het isentropisch rendement) beschreven door punten <M>1-2'-3-4.</M> Bepaal hiervoor de specifieke enthalpiën. Neem ook gelijk het werkelijke punt <M>2</M> mee.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="h1" prelabel={<M>h_1 =</M>} label="Specifieke enthalpie in punt 1" size="s" />
					<FloatUnitInput id="h2p" prelabel={<M>h_(2') =</M>} label="Specifieke enthalpie in punt 2'" size="s" />
					<FloatUnitInput id="h2" prelabel={<M>h_2 =</M>} label="Specifieke enthalpie in punt 2" size="s" />
					<FloatUnitInput id="h3" prelabel={<M>h_3 =</M>} label="Specifieke enthalpie in punt 3" size="s" />
					<FloatUnitInput id="h4" prelabel={<M>h_4 =</M>} label="Specifieke enthalpie in punt 4" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ TEvap, TCond, pEvap, pCond, dTSuperheating, dTSubcooling, T1, T2, T3, h1, h2p, h2, h3, h4, s1 }) => {
			return <>
				<Par>De verdamperdruk en condensordruk zijn gegeven als <M>p_v = {pEvap}</M> en <M>p_c = {pCond}.</M> De bijbehorende kooktemperaturen zijn <M>T_v = {TEvap}</M> en <M>T_c = {TCond}.</M> Hiermee kunnen we langs alle punten lopen.</Par>
				<Par>Om punt <M>1</M> te vinden gaan we op <M>{pEvap}</M> naar rechts tot we <M>{dTSuperheating}</M> voorbij de damplijn zijn. Bij de temperatuur van <M>{T1}</M> vinden we <M>h_1 = {h1}.</M> Voor punt <M>2'</M> volgen we de isentrope lijnen bij <M>s = {s1}</M> tot de druk van <M>{pCond}.</M> Hier zien we dat <M>h_(2') = {h2p}.</M> Punt 2 ligt op dezelfde hoogte (dezelfde druk) maar dan bij <M>T_2 = {T2}.</M> De enthalpie hiervan is <M>h_2 = {h2}.</M> Voor punt <M>3</M> gaan we naar links tot <M>{dTSubcooling}</M> voorbij de vloeistoflijn. Dit is bij een temperatuur van <M>{T3}</M> en de specifieke enthalpie is hier <M>h_3 = {h3}.</M> Ten slotte is er punt <M>4</M>. Hiervoor gaan we recht omlaag tot <M>{pEvap}.</M> Uiteraard geldt <M>h_4 = h_3 = {h4}.</M> Hiermee is de cyclus rond.</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken met alle bekende gegevens de koudefactor, de warmtefactor, het isentropisch rendement van de compressor en het compressorvermogen.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="epsilon" prelabel={<M>\varepsilon =</M>} label="Koudefactor" size="s" validate={FloatUnitInput.validation.any} />
					<FloatUnitInput id="COP" prelabel={<M>\varepsilon_w =</M>} label="Warmtefactor" size="s" validate={FloatUnitInput.validation.any} />
					<FloatUnitInput id="etai" prelabel={<M>\eta_i =</M>} label="Isentropisch rendement" size="s" validate={FloatUnitInput.validation.any} />
					<FloatUnitInput id="P" prelabel={<M>P =</M>} label="Compressorvermogen" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ h1, h2p, h2, h3, h4, wt, wtp, qin, qout, epsilon, COP, etai, mdot, P }) => {
			return <Par>
				Als eerste schrijven we alle warmtestormen op. De toegevoerde en afgevoerde warmte zijn
				<BMList>
					<BMPart>q_(toe) = h_1 - h_4 = {h1.float} - {h4.float} = {qin},</BMPart>
					<BMPart>q_(af) = h_2 - h_3 = {h2.float} - {h3.float} = {qout}.</BMPart>
				</BMList>
				De technische arbeid in de compressor is, in zowel het ideale (isentropische) geval als het werkelijke geval, gelijk aan
				<BMList>
					<BMPart>w_(t') = h_(2') - h_1 = {h2p.float} - {h1.float} = {wtp},</BMPart>
					<BMPart>w_t = h_2 - h_1 = {h2.float} - {h1.float} = {wt}.</BMPart>
				</BMList>
				Met deze waarden kunnen we alles berekenen. Als eerste zijn de koudefactor en warmtefactor gegeven door
				<BMList>
					<BMPart>\epsilon = \frac(q_(in))(w_t) = \frac{qin.float}{wt.float} = {epsilon},</BMPart>
					<BMPart>\epsilon_w = \frac(q_(out))(w_t) = \frac{qout.float}{wt.float} = {COP}.</BMPart>
				</BMList>
				Hiernaast zijn het isentropisch rendement en het vermogen van de compressor gelijk aan
				<BMList>
					<BMPart>\eta_i = \frac(w_(t'))(w_t) = \frac{wtp.float}{wt.float} = {etai},</BMPart>
					<BMPart>P = \dot(m)w_t = {mdot.float} \cdot {wt.float} = {P}.</BMPart>
				</BMList>
				Hiermee zijn all gevraagde waarden gevonden.
			</Par>
		},
	},
]
