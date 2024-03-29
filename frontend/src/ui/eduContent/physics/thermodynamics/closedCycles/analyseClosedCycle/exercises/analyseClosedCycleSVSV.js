import React from 'react'

import { Par, SubHead, M, BM, BMList, BMPart, InputTable } from 'ui/components'
import { useInput, InputSpace } from 'ui/form'
import { MultipleChoice, FloatUnitInput } from 'ui/inputs'
import { StepExercise, getFieldInputFeedback, getMCFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ p1o, V1o, T1o, p2o, p3o }) => {
	const choice = useInput('choice')
	return <>
		<Par>We bekijken een viertaktmotor die een Otto-cyclus uitvoert. Eerst zuigt de motor <M>{V1o}</M> lucht aan op <M>{p1o}</M> en <M>{T1o}</M> (punt 1). Bij het omhoog gaan van de zuiger wordt deze lucht isentropisch gecomprimeerd tot <M>{p2o}.</M> Vervolgens vindt de verbranding plaats, die de druk isochoor verder ophoogt tot <M>{p3o}.</M> Hierna wordt de zuiger isentropisch weer terug omlaag geduwd tot het beginvolume. Ten slotte wordt de lucht uitgestoten en wordt weer verse lucht aangezogen. (Je kunt deze stap zien als "isochore koeling".)</Par>
		<Par>Bepaal of dit een positief of negatief kringproces is en bereken de betreffende factor(en).</Par>
		<InputSpace>
			<MultipleChoice id="choice" choices={[
				"Dit is een positief kringproces.",
				"Dit is een negatief kringproces.",
			]} />
			{choice === 0 ? <>
				<Par>Wat is in dat geval het rendement?</Par>
				<Par>
					<FloatUnitInput id="eta" prelabel={<M>\eta =</M>} label="Rendement" size="s" validate={FloatUnitInput.validation.any} />
				</Par>
			</> : null}
			{choice === 1 ? <>
				<Par>Wat zijn in dat geval de koudefactor en de warmtefactor?</Par>
				<Par>
					<FloatUnitInput id="epsilon" prelabel={<M>\varepsilon =</M>} label="Koudefactor" size="s" validate={FloatUnitInput.validation.any} />
					<FloatUnitInput id="COP" prelabel={<M>\varepsilon_w =</M>} label="Warmtefactor" size="s" validate={FloatUnitInput.validation.any} />
				</Par>
			</> : null}
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => <>
			<Par>Maak een overzicht van de gaseigenschappen in elk punt.</Par>
			<InputSpace>
				<InputTable
					colHeads={['Druk', 'Volume', 'Temperatuur']}
					rowHeads={['Punt 1', 'Punt 2', 'Punt 3', 'Punt 4']}
					fields={[[
						<FloatUnitInput id="p1" label={<M>p_1</M>} size="l" />,
						<FloatUnitInput id="V1" label={<M>V_1</M>} size="l" />,
						<FloatUnitInput id="T1" label={<M>T_1</M>} size="l" />,
					], [
						<FloatUnitInput id="p2" label={<M>p_2</M>} size="l" />,
						<FloatUnitInput id="V2" label={<M>V_2</M>} size="l" />,
						<FloatUnitInput id="T2" label={<M>T_2</M>} size="l" />,
					], [
						<FloatUnitInput id="p3" label={<M>p_3</M>} size="l" />,
						<FloatUnitInput id="V3" label={<M>V_3</M>} size="l" />,
						<FloatUnitInput id="T3" label={<M>T_3</M>} size="l" />,
					], [
						<FloatUnitInput id="p4" label={<M>p_4</M>} size="l" />,
						<FloatUnitInput id="V4" label={<M>V_4</M>} size="l" />,
						<FloatUnitInput id="T4" label={<M>T_4</M>} size="l" />,
					]]} />
			</InputSpace>
		</>,
		Solution: ({ m, Rs, k, p1, V1, T1, p2, V2, T2, p3, V3, T3, p4, V4, T4 }) => {
			return <>
				<Par>
					In punt 1 weten we al dat <M>p_1 = {p1}</M>, <M>V_1 = {V1}</M> en <M>T_1 = {T1}.</M> We vinden de massa via de gaswet,
					<BM>m = \frac(p_1V_1)(R_sT_1) = \frac({p1.float} \cdot {p2.float})({Rs.float} \cdot {T1.float}) = {m}.</BM>
					In punt 2 is gegeven dat <M>p_2 = {p2}.</M> Via Poisson's wet <M>p_1V_1^n = p_2V_2^n</M> met <M>n = k = {k}</M> vinden we
					<BM>V_2 = \left(\frac(p_1)(p_2)\right)^(\frac(1)(n)) V_1 = \left(\frac{p1.float}{p2.float}\right)^(\frac{1}{k}) \cdot {V1.float} = {V2}.</BM>
					De temperatuur <M>T_2</M> volgt via de gaswet als
					<BM>T_2 = \frac(p_2V_2)(mR_s) = \frac({p2.float} \cdot {V2.float})({m.float} \cdot {Rs.float}) = {T2}.</BM>
					In punt 3 weten we dat <M>p_3 = {p3}</M> en <M>V_3 = V_2 = {V3}</M> (isochoor proces). Via de gaswet volgt
					<BM>T_3 = \frac(p_3V_3)(mR_s) = \frac({p3.float} \cdot {V3.float})({m.float} \cdot {Rs.float}) = {T3}.</BM>
					Voor punt 4 geldt <M>V_4 = V_1 = {V4}</M> (isochoor proces). Verder is proces 3-4 isentroop, waardoor we via <M>p_3V_3^n = p_4V_4^n</M> kunnen vinden dat
					<BM>p_4 = p_3 \left(\frac(V_3)(V_4)\right)^n = {p3.float} \cdot \left(\frac{V3.float}{V4.float}\right)^{k} = {p4}.</BM>
					Ten slotte volgt via de gaswet <M>T_4</M> als
					<BM>T_4 = \frac(p_4V_4)(mR_s) = \frac({p4.float} \cdot {V4.float})({m.float} \cdot {Rs.float}) = {T4}.</BM>
					Daarmee zijn alle eigenschappen bekend.
				</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Maak een overzicht van de toegevoerde warmte en de geleverde arbeid in elk proces.</Par>
			<InputSpace>
				<InputTable
					colHeads={[<span>Warmte <M>Q</M></span>, <span>Arbeid <M>W</M></span>]}
					rowHeads={['Stap 1-2', 'Stap 2-3', 'Stap 3-4', 'Stap 4-1']}
					fields={[[
						<FloatUnitInput id="Q12" label={<M>Q_(1-2)</M>} size="l" />,
						<FloatUnitInput id="W12" label={<M>W_(1-2)</M>} size="l" />,
					], [
						<FloatUnitInput id="Q23" label={<M>Q_(2-3)</M>} size="l" />,
						<FloatUnitInput id="W23" label={<M>W_(2-3)</M>} size="l" />,
					], [
						<FloatUnitInput id="Q34" label={<M>Q_(3-4)</M>} size="l" />,
						<FloatUnitInput id="W34" label={<M>W_(3-4)</M>} size="l" />,
					], [
						<FloatUnitInput id="Q41" label={<M>Q_(4-1)</M>} size="l" />,
						<FloatUnitInput id="W41" label={<M>W_(4-1)</M>} size="l" />,
					]]} />
			</InputSpace>
		</>,
		Solution: ({ m, cv, T1, T2, T3, T4, Q12, W12, Q23, W23, Q34, W34, Q41, W41, Wn }) => {
			return <>
				<Par>
					Voor de isentrope stap 1-2 zijn de energiestromen
					<BMList>
						<BMPart>Q_(1-2) = {Q12},</BMPart>
						<BMPart>W_(1-2) = -mc_v\left(T_2-T_1\right) = -{m.float} \cdot {cv.float} \cdot \left({T2.float} - {T1.float}\right) = {W12}.</BMPart>
					</BMList>
					Voor de isochore stap 2-3 hebben we
					<BMList>
						<BMPart>Q_(2-3) = mc_v \left(T_3 - T_2\right) = {m.float} \cdot {cv.float} \cdot \left({T3.float} - {T2.float}\right) = {Q23},</BMPart>
						<BMPart>W_(2-3) = {W23}.</BMPart>
					</BMList>
					Voor de isentrope stap 3-4 geldt
					<BMList>
						<BMPart>Q_(3-4) = {Q34},</BMPart>
						<BMPart>W_(3-4) = -mc_v\left(T_4-T_3\right) = -{m.float} \cdot {cv.float} \cdot \left({T4.float} - {T3.float}\right) = {W34}.</BMPart>
					</BMList>
					Ten slotte vinden we voor de isochore stap 4-1,
					<BMList>
						<BMPart>Q_(4-1) = mc_v \left(T_1 - T_4\right) = {m.float} \cdot {cv.float} \cdot \left({T1.float} - {T4.float}\right) = {Q41},</BMPart>
						<BMPart>W_(4-1) = {W41}.</BMPart>
					</BMList>
				</Par>
				<Par>
					Als check controleren we de energiebalans. Zo zien we
					<BMList>
						<BMPart>Q_(netto) = Q_(1-2) + Q_(2-3) + Q_(3-4) + Q_(4-1) = {Q12.float} {Q23.float.texWithPM} {Q34.float.texWithPM} {Q41.float.texWithPM} = {Wn},</BMPart>
						<BMPart>W_(netto) = W_(1-2) + W_(2-3) + W_(3-4) + W_(4-1) = {W12.float} {W23.float.texWithPM} {W34.float.texWithPM} {W41.float.texWithPM} = {Wn}.</BMPart>
					</BMList>
					Deze waarden zijn gelijk aan elkaar, dus hebben we geen rekenfout gemaakt.
				</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Bepaal of dit een positief of een negatief kringproces is.</Par>
			<InputSpace>
				<MultipleChoice id="choice" choices={[
					"Dit is een positief kringproces.",
					"Dit is een negatief kringproces.",
				]} />
			</InputSpace>
		</>,
		Solution: () => <Par>De netto arbeid <M>W_(netto)</M> is positief, wat betekent dat dit een positief kringproces is. Dit betekent ook dat we het rendement kunnen berekenen. (De koudefactor en warmtefactor zijn zinloos bij een positief kringproces.)</Par>,
	},
	{
		Problem: () => <>
			<Par>Bereken, gebaseerd op de energiestromen, het rendement.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="eta" prelabel={<M>\eta =</M>} label="Rendement" size="s" validate={FloatUnitInput.validation.any} />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ Wn, Qin, eta }) => {
			return <Par>
				De processtappen waarop warmte toegevoerd wordt (<M>Q \gt 0</M>) is alleen de verbrandingsstap 2-3. De toegevoerde warmte is dus <M>Q_(toe) = Q_(2-3) = {Qin}.</M> De netto arbeid is al bekend als <M>W_(netto) = {Wn}.</M> Hiermee volgt het rendement als
				<BM>\eta = \frac(\rm nuttig)(\rm invoer) = \frac(W_(netto))(Q_(toe)) = \frac{Wn}{Qin} = {eta} = {eta.setUnit('%')}.</BM>
				Dit is een redelijk hoog rendement. Dat komt omdat we op erg hoge temperatuur warmte toevoeren en dit op relatief lage temperatuur weer lozen. Verder is het ook een geidealiseerd proces: in de praktijk spelen er nog zaken als frictie mee die het rendement een stuk omlaag halen.
				<SubHead>Short-Cut</SubHead>
				Eventueel had het rendement ook berekend kunnen worden via
				<BM>\eta = \frac(Q_(toe) - Q_(af))(Q_(toe)) = \frac(mc_v\left(T_3 - T_2\right) - mc_v\left(T_4 - T_1\right))(mc_v\left(T_3 - T_2\right)) = \frac(\left(T_3 - T_2\right) - \left(T_4 - T_1\right))(\left(T_3 - T_2\right)).</BM>
				Kortom, zodra de temperaturen van een Otto-cyclus bekend zijn kun je gelijk het rendement berekenen. Dat geldt echter niet voor alle cycli, dus werkt deze short-cut alleen hier.
			</Par>
		},
	},
]

const getFeedback = (exerciseData) => {
	return {
		...getFieldInputFeedback(exerciseData, ['p1', 'V1', 'T1', 'p2', 'V2', 'T2', 'p3', 'V3', 'T3', 'p4', 'V4', 'T4', 'Q12', 'W12', 'Q23', 'W23', 'Q34', 'W34', 'Q41', 'W41', 'eta']),
		...getMCFeedback(exerciseData, {
			choice: {
				step: 3,
				text: [
					<span>Ja! Het is inderdaad een positief kringproces: de pijlen in het <M>p</M>-<M>V</M>-diagram gaan met de klok mee en <M>W_(netto)</M> is positief.</span>,
					<span>Nee, het is geen negatief kringproces. Kijk goed of de netto arbeid <M>W_(netto) = W_(1-2) + W_(2-3) + W_(3-4) + W_(4-1)</M> positief of negatief is.</span>,
				],
			}
		}),
		epsilon: (exerciseData.input.epsilon ? { correct: false, text: 'Aangezien we geen negatief kringproces hebben, is het zinloos om de koudefactor te berekenen.' } : undefined),
		COP: (exerciseData.input.COP ? { correct: false, text: 'Om dezelfde reden heeft ook de warmtefactor geen betekenis hier.' } : undefined),
	}
}
