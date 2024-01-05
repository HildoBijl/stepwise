import React from 'react'

import { Par, M, BM, BMList, BMPart } from 'ui/components'
import { InputSpace } from 'ui/form'
import { MultipleChoice, FloatUnitInput } from 'ui/inputs'
import { StepExercise, getFieldInputFeedback, getMCFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ m, T1, T2, n }) => {
	return <>
		<Par>In een fietspomp wordt tijdens één slag <M>{m}</M> lucht gecomprimeerd. De temperatuur van de lucht voor de compressie is <M>{T1}</M>, en na de compressie is dit <M>{T2}.</M> De compressie verloopt niet isentroop: via metingen is de procescoëfficiënt bepaald als <M>n = {n}.</M> Bereken hoeveel warmte <M>Q</M> er in het gas is gestopt en hoeveel arbeid <M>W</M> het gas heeft verricht tijdens dit proces.</Par>
		<InputSpace>
			<Par>
				<FloatUnitInput id="Q" prelabel={<M>Q =</M>} label={<span><M>Q</M></span>} size="s" />
				<FloatUnitInput id="W" prelabel={<M>W =</M>} label={<span><M>W</M></span>} size="s" />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => <>
			<Par>Bepaal het soort proces.</Par>
			<InputSpace>
				<MultipleChoice id="process" choices={[
					<span>Dit is een isobaar proces.</span>,
					<span>Dit is een isochoor proces.</span>,
					<span>Dit is een isotherm proces.</span>,
					<span>Dit is een isentroop proces.</span>,
					<span>Dit is alleen een polytroop proces: specifieker kunnen we niet zijn.</span>,
				]} randomOrder={true} />
			</InputSpace>
		</>,
		Solution: () => {
			return <Par>Het is niet een isentroop proces (gegeven) maar ook geen isotherm proces (want de temperatuur neemt toe). Daarnaast is de <M>n</M>-waarde niet gelijk aan <M>0</M> (isochoor) of <M>\infty</M> (isobaar). Het enige wat we kunnen zeggen is dat het een polytroop proces is met een bepaalde procescoëfficiënt <M>n.</M></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Zoek de formules op die horen bij een polytroop proces en kies degenen die het handigst zijn om hier te gebruiken.</Par>
			<InputSpace>
				<MultipleChoice id="eq" choices={[
					<span><M>Q = \frac(k)(k-1) p \left(V_2 - V_1\right)</M> en <M>W = p\left(V_2 - V_1\right)</M></span>,
					<span><M>Q = mc_p\left(T_2-T_1\right)</M> en <M>W = mR_s\left(T_2-T_1\right)</M></span>,
					<span><M>Q = \frac(1)(k-1) V \left(p_2 - p_1\right)</M> en <M>W = 0</M></span>,
					<span><M>Q = mc_v\left(T_2 - T_1\right)</M> en <M>W = 0</M></span>,
					<span><M>Q = pV \ln\left(\frac(V_2)(V_1)\right)</M> en <M>W = pV \ln\left(\frac(V_2)(V_1)\right)</M></span>,
					<span><M>Q = mR_sT \ln\left(\frac(V_2)(V_1)\right)</M> en <M>W = mR_sT \ln\left(\frac(V_2)(V_1)\right)</M></span>,
					<span><M>Q = 0</M> en <M>W = -\frac(1)(k-1)\left(p_2V_2 - p_1V_1\right)</M></span>,
					<span><M>Q = 0</M> en <M>W = -\frac(mR_s)(k-1)\left(T_2 - T_1\right)</M></span>,
					<span><M>Q = \frac(c)(R_s) \left(p_2V_2 - p_1V_1\right)</M> en <M>W = -\frac(1)(n-1) \left(p_2V_2 - p_1V_1\right)</M></span>,
					<span><M>Q = mc\left(T_2 - T_1\right)</M> en <M>W = -\frac(mR_s)(n-1)\left(T_2 - T_1\right)</M></span>,
				]} randomOrder={true} pick={5} include={[8, 9]} />
			</InputSpace>
		</>,
		Solution: () => {
			return <Par>Er zijn verschillende formules die horen bij een polytroop proces. We weten hier de massa en de temperatuur, waardoor de handigste formules hier dus <M>Q = mc\left(T_2 - T_1\right)</M> en <M>W = -\frac(mR_s)(n-1)\left(T_2 - T_1\right)</M> zijn.</Par>
		},
	},
	{
		Problem: () => {
			return <>
				<Par>Zoek voor lucht de specifieke gasconstante <M>R_s</M> en de soortelijke warmte bij constant volume <M>c_v</M> op.</Par>
				<InputSpace>
					<Par>
						<FloatUnitInput id="Rs" prelabel={<M>R_s =</M>} label="Specifieke gasconstante" size="s" />
						<FloatUnitInput id="cv" prelabel={<M>c_v =</M>} label="Soortelijke warmte" size="s" />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ Rs, cv }) => {
			return <Par>Voor lucht geldt <M>R_s = {Rs}</M> en <M>c_v = {cv}.</M></Par>
		},
	},
	{
		Problem: () => {
			return <>
				<Par>Bereken de soortelijke warmte <M>c</M> die hoort bij dit proces.</Par>
				<InputSpace>
					<Par>
						<FloatUnitInput id="c" prelabel={<M>c =</M>} label="Soortelijke warmte" size="s" />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ n, Rs, cv, c }) => {
			return <Par>Voor elk proces met procescoëfficiënt <M>n</M> kunnen we de soortelijke warmte berekenen via <BM>c = c_v - \frac(R_s)(n-1).</BM> Getallen invullen geeft <BM>c = {cv.float} - \frac({Rs.float})({n.float} - 1) = {c}.</BM> Hiermee kunnen we zo de toegevoerde warmte berekenen.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Zet de gegeven waarden in eenheden waarmee we hier mogen rekenen.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="ms" prelabel={<M>m =</M>} label="Massa" size="s" />
					<FloatUnitInput id="T1s" prelabel={<M>T_1 =</M>} label="Temperatuur" size="s" />
					<FloatUnitInput id="T2s" prelabel={<M>T_2 =</M>} label="Temperatuur" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ ms, T1s, T2s }) => {
			return <Par>De massa moet zeker in standaard eenheden. Dus schrijven we <M>m = {ms}.</M> Bij de temperatuur moeten we alleen een temperatuursverschil in de formule invullen, en dus mogen we de temperatuur in graden Celsius laten staan. Oftewel, <M>T_1 = {T1s}</M> en <M>T_2 = {T2s}.</M> Natuurlijk is het ook prima om in Kelvin te rekenen.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken met de gegeven formules en bekende waarden de warmte <M>Q</M> en de arbeid <M>W.</M></Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="Q" prelabel={<M>Q =</M>} label={<span><M>Q</M></span>} size="s" />
					<FloatUnitInput id="W" prelabel={<M>W =</M>} label={<span><M>W</M></span>} size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ Rs, n, ms, c, T1s, T2s, Q, W }) => {
			return <Par>We hoeven alleen maar de formules in te vullen. Zo vinden we
				<BMList>
					<BMPart>Q = mc\left(T_2 - T_1\right) = {ms.float} \cdot {c.float} \cdot \left({T2s.float} - {T1s.float}\right) = {Q},</BMPart>
					<BMPart>W = -\frac(mR_s)(n-1)\left(T_2 - T_1\right) = -\frac({ms.float} \cdot {Rs.float})({n.float} - 1) \cdot \left({T2s.float} - {T1s.float}\right) = {W}.</BMPart>
				</BMList>
				De mintekens hier betekenen dat er warmte <strong>uit het gas</strong> stroomt en dat er arbeid <strong>op het gas</strong> wordt verricht. Dit klopt, want we zijn de lucht aan het comprimeren, dus dit kost arbeid. En omdat de lucht warmer wordt stroomt er warmte uit. De mintekens moeten zeker wel vermeld worden, want ze geven de richtingen van deze energiestromen aan.
			</Par>
		},
	},
]

const getFeedback = (exerciseData) => {
	return {
		...getFieldInputFeedback(exerciseData, ['Rs', 'cv', 'c', 'ms', 'T1s', 'T2s', 'Q', 'W']),
		...getMCFeedback(exerciseData, {
			process: {
				step: 1,
				text: [
					'Nee, dan zou de druk constant moeten blijven.',
					'Nee, dan zou het volume constant moeten blijven, maar het gas wordt gecomprimeerd.',
					'Nee, dan zou de temperatuur constant moeten blijven.',
					'Nee, dan zou er geen warmte toegevoerd/afgevoerd mogen worden. Maar om de temperatuur gelijk te blijven wordt er hier zeker wel warmte afgevoerd.',
					<span>Ja, dit is een algemeen proces waarbij niets constant blijft en we alleen kunnen rekenen met een procescoëfficiënt <M>n.</M></span>,
				],
			},
			eq: {
				step: 2,
				text: [
					'Nee, dit zijn de formules voor een isobaar proces. Daarnaast weten we de druk en het volume helemaal niet.',
					'Nee, dit zijn de formules voor een isobaar proces.',
					'Nee, dit zijn de formules voor een isochoor proces. Daarnaast weten we de druk en het volume helemaal niet.',
					'Nee, dit zijn de formules voor een isochoor proces.',
					'Nee, dit zijn de formules voor een isotherm proces. Daarnaast weten we de druk en het volume helemaal niet.',
					'Nee, dit zijn de formules voor een isotherm proces.',
					'Nee, dit zijn de formules voor een isentroop proces. Daarnaast weten we de druk en het volume helemaal niet.',
					'Nee, dit zijn de formules voor een isentroop proces.',
					'Net niet! Dit zijn wel de formules voor een polytroop proces. We weten de druk en het volume alleen niet, en dus zijn deze formules niet handig om te gebruiken.',
					'Ja! Dit zijn inderdaad de formules voor een polytroop proces, en we weten de massa en de temperatuur, dus dat moet goed komen.',
				],
			}
		})
	}
}
