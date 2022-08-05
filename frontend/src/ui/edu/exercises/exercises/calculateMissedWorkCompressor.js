import React from 'react'

import { M, BM, BMList, BMPart } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'

import StepExercise from '../types/StepExercise'
import { useSolution } from '../util/SolutionProvider'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedback} />
}

const Problem = ({ p1, T1, p2, n }) => <>
	<Par>In de compressor van een gasturbine wordt continu lucht gecomprimeerd van <M>{p1}</M> tot <M>{p2}.</M> De temperatuur van de lucht bij de ingang is gelijk aan de omgevingstemperatuur van <M>{T1}.</M> De compressor werkt niet isentroop: er stroomt een beetje warmte weg naar de omgeving. Ga uit van een procescoëfficiënt van <M>n={n}.</M> Bereken de theoretisch gemiste specifieke arbeid als gevolg van deze niet-isentropische compressie.</Par>
	<InputSpace>
		<Par>
			<FloatUnitInput id="wm" prelabel={<M>w_m=</M>} label="Gemiste specifieke arbeid" size="s" />
		</Par>
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Bereken via Poisson's wet de temperatuur van de lucht bij de uitgang van de compressor.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="T2" prelabel={<M>T_2=</M>} label="Uitgangstemperatuur" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { n, p1, p2, T1, T2 } = useSolution()
			return <Par>Poisson's wet zegt dat <BM>\frac(T_1^n)(p_1^(n-1)) = \frac(T_2^n)(p_2^(n-1)).</BM> Hierbij moet <M>T_1 = {T1}</M> uiteraard in Kelvin staan. Het bovenstaande oplossen voor <M>T_2</M> gaat via
				<BMList>
					<BMPart>T_2^n = T_1^n \frac(p_2^(n-1))(p_1^(n-1)) = T_1^n \left(\frac(p_2)(p_1)\right)^(n-1),</BMPart>
					<BMPart>T_2 = \left(T_1^n \left(\frac(p_2)(p_1)\right)^(n-1)\right)^(\frac(1)(n)) = T_1 \left(\frac(p_2)(p_1)\right)^(\frac(n-1)(n)) = {T1.float} \left(\frac{p2.float}{p1.float}\right)^(\frac({n}-1)({n})) = {T2}.</BMPart>
				</BMList>
				Merk op dat we de druk in <M>{p1.unit}</M> mogen laten staan, omdat we met een drukverhouding rekenen.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken de specifieke entropieverandering van de lucht binnen de compressor.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="dsIn" prelabel={<M>\Delta s_(binnen)=</M>} label="Specifieke entropieverandering" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { p1, p2, T1, T2, dsIn, cp, Rs } = useSolution()
			return <>
				<Par>De entropieverandering valt te berekenen vanuit de druk en de temperatuur volgens <BM>\Delta s_(binnen) = c_p \ln\left(\frac(T_2)(T_1)\right) - R_s \ln\left(\frac(p_2)(p_1)\right) = {cp.float} \cdot \ln\left(\frac{T2.float}{T1.float}\right) - {Rs.float} \cdot \ln\left(\frac{p2.float}{p1.float}\right) = {dsIn}.</BM> Dit is negatief, wat logisch is: er stroomt een beetje warmte weg naar buiten.</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken de specifieke warmte die <em>wegstroomt</em> naar de omgeving.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="q" prelabel={<M>q=</M>} label="Specifieke warmte" positive={true} size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { n, T1, T2, cv, Rs, c, q } = useSolution()
			return <>
				<Par>Om de afgevoerde specifieke warmte te berekenen, is de soortelijke warmte <M>c</M> van het proces nodig. Deze is gelijk aan <BM>c = c_v - \frac(R_s)(n-1) = {cv.float} - \frac{Rs.float}({n.float} - 1) = {c}.</BM> Hiermee vinden we de specifieke warmte als <BM>q = c \left(T_2 - T_1\right) = {c.float} \cdot \left({T2.float} - {T1.float}\right) = {q.multiply(-1)}.</BM> Merk op: dit is de warmte <em>toegevoerd</em> tijdens de compressie. De vraag is echter welke warmte <em>wegstroomt</em>, wat het omgekeerde is. Hierdoor is het juiste antwoord <M>q = {q}.</M></Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken de specifieke entropieverandering van de omgeving.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="dsOut" prelabel={<M>\Delta s_(buiten)=</M>} label="Specifieke entropieverandering" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { q, T1, dsOut } = useSolution()
			return <>
				<Par>We kunnen aannemen dat de temperatuur van de omgeving constant is. De entropieverandering volgt nu via <BM>\Delta s_(buiten) = \frac(q)(T) = \frac{q.float}{T1.float} = {dsOut}.</BM> Dit is positief, wat logisch is: de warmte stroomt naar de omgeving toe.</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken de totale specifieke entropieverandering.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="ds" prelabel={<M>\Delta s=</M>} label="Specifieke entropieverandering" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { dsIn, dsOut, ds } = useSolution()
			return <>
				<Par>De totale entropieverandering is simpelweg de som van de entropieverschillen op verschillende plekken. We vinden zo <BM>\Delta s = \Delta s_(binnen) + \Delta s_(buiten) = {dsIn.float} {dsOut.float.texWithPM} = {ds}.</BM> Dit is positief, wat volgens de tweede hoofdwet altijd het geval moet zijn.</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Gebruik de totale specifieke entropieverandering om de gemiste specifieke arbeid te berekenen.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="wm" prelabel={<M>w_m =</M>} label="Gemiste specifieke arbeid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { T1, ds, wm } = useSolution()
			return <>
				<Par>De koudste temperatuur waarop in dit probleem warmte geloosd kan worden is de omgevingstemperatuur <M>T_1 = {T1}.</M> Via de standaard formule voor gemiste arbeid vinden we zo <BM>w_m = T_1 \Delta s = {T1.float} \cdot {ds.float} = {wm}.</BM> Merk op dat we deze formule zowel met hoofdletters (<M>W</M> en <M>S</M>) als met kleine letters (<M>w</M> en <M>s</M>) kunnen gebruiken.</Par>
			</>
		},
	},
]