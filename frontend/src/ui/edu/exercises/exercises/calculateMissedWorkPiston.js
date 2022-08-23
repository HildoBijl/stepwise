import React from 'react'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/FormPart'

import StepExercise from '../types/StepExercise'
import { useSolution } from '../util/SolutionProvider'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedback} />
}

const Problem = ({ m, TAtm, T1, T2, T2p }) => <>
	<Par>We meten de zuiger van een oude benzinemotor door. Specifiek bekijken we de expansiestap, waarbij de zuiger weer naar beneden gedrukt wordt. Vòòr deze expansie zit er <M>m = {m}</M> lucht in de zuiger met temperatuur <M>T_1 = {T1}.</M> Omdat het een oude motor betreft verloopt de expansie niet isentroop: de temperatuur ná expansie is <M>T_2 = {T2}.</M> De procescoëfficiënt <M>n</M> is onbekend.</Par>
	<Par>Vervolgens doen we grondig onderhoud aan de motor, waardoor de expansie wel weer isentroop verloopt. Vòòr expansie gelden dezelfde eigenschappen (<M>m</M> en <M>T_1</M>) maar ná expansie is de temperatuur, vanwege de afwezigheid van frictie, nu nog maar <M>T_(2') = {T2p}.</M> Het eindvolume is wel hetzelfde.</Par>
	<Par>Bereken hoeveel arbeid er in de eerste situatie (voor het onderhoud) in theorie gemist werd bij elke expansieslag. Doe dit via een entropieberekening. Gebruik hierbij een minimumtemperatuur waarop warmte geloosd kan worden van <M>T_(omg) = {TAtm}.</M></Par>
	<InputSpace>
		<Par>
			<FloatUnitInput id="Wm" prelabel={<M>W_m=</M>} label="Gemiste arbeid" size="s" />
		</Par>
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>De truc bij deze opgave is om het niet-isentropische proces (van voor de onderhoud) als "twee processen" te zien. Het eerste proces is hierbij de isentropische expansie: van punt <M>1</M> naar het theoretische punt <M>2'.</M> Bereken voor deze isentropische stap de entropieverandering.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="dS12p" prelabel={<M>\Delta S_(1-2') =</M>} label="Entropieverandering" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { dS12p } = useSolution()
			return <>
				<Par>Bij een isentropisch proces is de entropieverandering altijd <M>\Delta S_(1-2') = {dS12p}.</M></Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>De tweede stap is die van punt <M>2'</M> naar punt <M>2.</M> Merk op dat in deze punten het volume gelijk is. Bereken voor deze stap de entropieverandering.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="dS2p2" prelabel={<M>\Delta S_(2'-2) =</M>} label="Entropieverandering" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { m, cv, T2, T2p, dS2p2 } = useSolution()
			return <>
				<Par>Bij deze stap blijft het volume constant. Het is dus een isochoor proces met <M>c = c_v = {cv}.</M> De entropieverandering is hierbij dus <BM>\Delta S_(2'-2) = m c_v \ln\left(\frac(T_2)(T_(2'))\right) = {m.float} \cdot {cv.float} \cdot \ln\left(\frac{T2.float}{T2p.float}\right) = {dS2p2}.</BM></Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken de totale entropieverandering bij het gehele proces, van punt <M>1</M> naar punt <M>2.</M></Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="dS" prelabel={<M>\Delta S_(1-2) =</M>} label="Entropieverandering" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { dS12p, dS2p2, dS } = useSolution()
			return <>
				<Par>Voor de totale entropieverandering tellen we de entropieveranderingen van de stappen op. Dit gaat via <BM>\Delta S_(1-2) = \Delta S_(1-2') + \Delta S_(2'-2) = {dS12p.float} {dS2p2.float.texWithPM} = {dS}.</BM></Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Gebruik de entropieverandering om de gemiste arbeid te berekenen.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="Wm" prelabel={<M>W_m =</M>} label="Gemiste arbeid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { TAtm, dS, Wm } = useSolution()
			return <>
				<Par>De koudste temperatuur waarop in dit probleem warmte geloosd kan worden is de omgevingstemperatuur <M>T_(omg) = {TAtm}.</M> Via de standaard formule voor gemiste arbeid vinden we zo <BM>W_m = T_(omg) \Delta S = {TAtm.float} \cdot {dS.float} = {Wm}.</BM></Par>
			</>
		},
	},
]