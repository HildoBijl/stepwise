import React from 'react'

import { FloatUnit } from 'step-wise/inputTypes'

import { Par, SubHead, M, BM, BMList, BMPart } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { StepExercise } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} />
}

const Problem = ({ Qo, Two, Tco }) => <>
	<Par>In een fabriekshal staan twee grote drukvaten. Het warme vat heeft een temperatuur van <M>{Two}</M> en het koude vat zit op <M>{Tco}.</M> Vanwege dit temperatuursverschil stroomt er <M>{Qo}</M> aan warmte van het warme vat naar het koude. Deze warmtestroom wordt nu niet gebruikt om arbeid te genereren. Bereken hoeveel arbeid hiermee in theorie gemist wordt. Je mag ervan uitgaan dat de vaten groot genoeg zijn dat de temperatuur ervan niet verandert.</Par>
	<InputSpace>
		<Par>
			<FloatUnitInput id="Wm" prelabel={<M>W_m=</M>} label="Gemiste arbeid" size="s" />
		</Par>
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Bereken de totale entropieverandering die plaatsvindt vanwege deze warmtestroom.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="dS" prelabel={<M>\Delta S =</M>} label="Totale entropieverandering" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ Tw, Tc, Qw, Qc, dSw, dSc, dS }) => {
			return <>
				<Par>Als eerste zetten we de temperaturen in Kelvin, volgens <M>T_w = {Tw}</M> en <M>T_k = {Tc}.</M> Hiermee berekenen we de entropieveranderingen van elk vat. Deze zijn
					<BMList>
						<BMPart>\Delta S_w = \frac(Q_w)(T_w) = \frac{Qw.float}{Tw.float} = {dSw},</BMPart>
						<BMPart>\Delta S_k = \frac(Q_k)(T_k) = \frac{Qc.float}{Tc.float} = {dSc}.</BMPart>
					</BMList>
					Merk op dat we een uitgaande warmtestroom negatief rekenen. De totale entropieverandering is hiermee
					<BM>\Delta S = \Delta S_w + \Delta S_k = {dSw.float} {dSc.float.texWithPM} = {dS}.</BM>
					Dit is positief, zoals de tweede hoofdwet vereist.</Par>
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
		Solution: ({ Q, Tc, Tw, dS, Wm }) => {
			const eta = new FloatUnit('1.000000000000').subtract(Tc.divide(Tw))
			return <>
				<Par>De koudste temperatuur waar in dit probleem warmte geloosd kan worden is <M>T_k = {Tc}.</M> Via de standaard formule voor gemiste arbeid vinden we zo <BM>W_m = T_k \Delta S = {Tc.float} \cdot {dS.float} = {Wm}.</BM></Par>
				<SubHead>Alternatieve oplossing</SubHead>
				<Par>We hadden dit probleem ook anders op kunnen lossen. De meeste arbeid die we kunnen krijgen, in een proces met maximum temperatuur <M>T_w</M> en minimum temperatuur <M>T_k</M>, volgt vanuit een Carnot-proces. Dit proces heeft een rendement van <BM>\eta_C = 1 - \frac(T_k)(T_w) = 1 - \frac{Tc.float}{Tw.float} = {eta}.</BM> De totale geleverde warmte vanuit het warme vat is <M>Q_(toe) = {Q}.</M> Hiermee had een Carnot-proces dus een arbeid kunnen genereren van <BM>W = \eta_C Q_(toe) = {eta.float} \cdot {Q.float} = {Wm}.</BM> Dit komt op hetzelfde uit, zoals verwacht.</Par>
			</>
		},
	},
]
