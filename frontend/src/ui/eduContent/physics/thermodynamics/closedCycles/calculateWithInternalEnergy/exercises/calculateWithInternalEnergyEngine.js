import React from 'react'

import { Par, SubHead, M, BM, BMList, BMPart } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { StepExercise } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} />
}

const Problem = ({ p1, V1, V2, n }) => <>
	<Par>De zuiger van een benzinemotor zit in zijn hoogste stand, waardoor de lucht is samengedrukt tot <M>{V1}.</M> De brandstof is zojuist ontbrand, waardoor de druk is toegenomen tot <M>{p1}.</M> Wij bekijken de expansiestap, waarbij de zuiger terug naar beneden wordt geduwd. Aan het einde van deze stap is het volume <M>{V2}.</M> Dit proces heeft een procescoëfficiënt van <M>n = {n}.</M> Wat is de verandering in de inwendige energie <M>U</M> tijdens deze expansie?</Par>
	<InputSpace>
		<Par>
			<FloatUnitInput id="dU" prelabel={<M>\Delta U=</M>} label={<span>Verandering in <M>U</M></span>} size="s" />
		</Par>
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Bereken allereerst via Poisson's wet de druk <M>p_2</M> aan het einde van de expansiestap.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="p2" prelabel={<M>p_2=</M>} label="Druk" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ p1, V1, p2, V2, n }) => {
			return <Par>Er is gegeven dat <M>p_1 = {p1},</M> <M>V_1 = {V1},</M> <M>V_2 = {V2}</M> en <M>n = {n}.</M> We vinden <M>p_2</M> via Poisson's wet,
				<BMList>
					<BMPart>p_1V_1^n = p_2V_2^n,</BMPart>
					<BMPart>p_2 = p_1 \frac(V_1^n)(V_2^n) = p_1 \left(\frac(V_1)(V_2)\right)^n = {p1.float} \cdot \left(\frac{V1.float}{V2.float}\right)^{n} = {p2}.</BMPart>
				</BMList>
				Dit is een stuk lagere druk, wat logisch is, omdat het volume sterk is toegenomen.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken de tijdens het proces toegevoerde warmte <M>Q</M> en door de lucht geleverde arbeid <M>W.</M></Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="Q" prelabel={<M>Q =</M>} label={<span><M>Q</M></span>} size="s" />
					<FloatUnitInput id="W" prelabel={<M>W =</M>} label={<span><M>W</M></span>} size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ cv, Rs, c, p1s, V1s, p2s, V2s, n, Q, W }) => {
			return <>
				<Par>Dit is een algemeen polytroop proces, waardoor het handig is om eerst de soortelijke warmte <M>c</M> horende bij dit proces te berekenen. Deze volgt uit de procescoëfficiënt <M>n={n}</M> als
					<BM>c = c_v - \frac(R_s)(n-1) = {cv.float} - \frac({Rs.float})({n}-1) = {c}.</BM>
					Hiermee kunnen we de toegevoerde warmte berekenen als
					<BM>Q = \frac(c)(R_s)\left(p_2V_2 - p_1V_1\right) = \frac{c.float}{Rs.float} \cdot \left({p2s.float} \cdot {V2s.float} - {p1s.float} \cdot {V1s.float}\right) = {Q}.</BM>
					De geleverde arbeid volgt soortgelijk via
					<BM>W = -\frac(1)(n-1) \left(p_2V_2 - p_1V_1\right) = -\frac(1)({n}-1) \cdot \left({p2s.float} \cdot {V2s.float} - {p1s.float} \cdot {V1s.float}\right) = {W}.</BM>
					Het is ten slotte handig om intuïtief te checken of de tekens kloppen. De arbeid <M>W</M> moet zeker positief zijn, omdat het gas bij deze expansiestap veel arbeid levert. Dit klopt dus. Ook de toegevoerde warmte <M>Q</M> moet positief zijn. Dit laatste is echter wat lastiger in te zien.</Par>
				<Par>Om te begrijpen waarom <M>Q &gt; 0</M> moeten we eerst stilstaan bij het feit dat <M>n = {n}.</M> Dit betekent dat het proces ergens tussen een isentroop en een isotherm proces inzit. Bij een isentroop proces geldt dat <M>Q = 0.</M> Bij een isotherme expansie geldt dat <M>Q = W</M> waardoor <M>Q</M> net als <M>W</M> sterk positief is. Omdat ons proces tussen een isentroop en een isotherm proces in zit geldt dat <M>Q</M> positief moet zijn, maar niet zo groot als <M>W.</M> Dat klopt bij onze getallen inderdaad.</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken via de eerste hoofdwet de verandering <M>\Delta U</M> in inwendige energie.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="dU" prelabel={<M>\Delta U=</M>} label={<span>Verandering in <M>U</M></span>} size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ cv, Rs, p1s, V1s, p2s, V2s, Q, W, dU }) => {
			return <>
				<Par>De eerste hoofdwet zegt dat <M>Q = \Delta U + W.</M> Hieruit volgt direct dat <BM>\Delta U = Q - W = {Q.float} - {W.float} = {dU}.</BM>
					Omdat het gas arbeid geleverd heeft is het veel energie kwijtgeraakt, wat betekent dat <M>\Delta U</M> negatief is.</Par>
				<SubHead>Short-cut</SubHead>
				<Par>We hadden dit gehele probleem ook kunnen oplossen zonder eerst <M>Q</M> en <M>W</M> te berekenen. Er geldt namelijk ook dat
					<BM>\Delta U = m c_v \Delta T.</BM>
					Vanwege de gaswet <M>pV = mR_sT</M> geldt hierdoor ook
					<BM>m \Delta T = \frac(\Delta \left(pV\right))(R_s) = \frac(p_2V_2 - p_1V_1)(R_s).</BM>
					Hiermee hebben we een nieuwe formule voor <M>\Delta U</M> afgeleid, zijnde
					<BM>\Delta U = \frac(c_v)(R_s)\left(p_2V_2 - p_1V_1\right).</BM>
					Invullen van getallen geeft ons
					<BM>\Delta U = \frac{cv.float}{Rs.float} \cdot \left({p2s.float} \cdot {V2s.float} - {p1s.float} \cdot {V1s.float}\right) = {dU}.</BM>
					Via handig omschrijven van formules hadden we ons dus wat rekenwerk kunnen besparen.</Par>
			</>
		},
	},
]
