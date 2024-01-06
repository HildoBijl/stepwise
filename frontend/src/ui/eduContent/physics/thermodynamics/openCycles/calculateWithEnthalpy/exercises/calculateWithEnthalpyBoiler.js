import React from 'react'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { StepExercise, getAllInputFieldsFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedback} />
}

const Problem = ({ Q, m }) => <>
	<Par>We meten een dag lang een CV-ketel in een huis door. Gedurende deze dag is er <M>{m}</M> aan water doorgestroomd. Dit water heeft in totaal <M>{Q}</M> aan warmte toegevoerd gekregen. Ga ervan uit dat deze warmte gelijkmatig aan het water is toegevoerd: elke liter water is evenveel verwarmd. De verwarming gebeurt op constant druk. Wat is de specifieke enthalpietoename van het water, vanwege deze verwarming?</Par>
	<InputSpace>
		<Par>
			<FloatUnitInput id="dh" prelabel={<M>\Delta h=</M>} label="Specifieke enthalpietoename" size="s" />
		</Par>
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Bereken de toegevoerde specifieke warmte.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="q" prelabel={<M>q=</M>} label="Toegevoerde specifieke warmte" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ Qs, m, c, dT, q }) => {
			return <Par>De toegevoerde specifieke warmte is de warmte die is toegevoerd per kilogram water. Er is in totaal <M>{Qs}</M> toegevoerd aan <M>{m}</M> water. Per kilogram is dit dus <BM>q = \frac(Q)(m) = \frac{Qs.float}{m.float} = {q}.</BM> Eventueel kunnen we nog berekenen dat dit overeenkomt met een temperatuurstoename van <BM>\Delta T = \frac(q)(c) = \frac{q.float}{c.float} = {dT},</BM> wat een realistische temperatuurstoename is van water in een CV-ketel.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Vind de specifieke technische arbeid bij dit isobare verwarmingsproces.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="wt" prelabel={<M>w_t =</M>} label="Specifieke arbeid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ wt }) => {
			return <>
				<Par>Bij een isobaar proces geldt altijd dat de technische arbeid nul is. Oftewel, <M>w_t = {wt}.</M></Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken aan de hand van de eerste hoofdwet de toename in specifieke enthalpie.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="dh" prelabel={<M>\Delta h =</M>} label="Specifieke enthalpietoename" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ q, wt, dh }) => {
			return <>
				<Par>De eerste hoofdwet voor open systemen zegt direct dat <BM>\Delta h = q - w_t = {q.float} - {wt.float} = {dh}.</BM> De toename in enthalpie is dus exact gelijk aan de toegevoerde warmte, wat logisch is. Immers, je kunt enthalpie zien als een vorm van "inwendige energie" (waar ook rekening gehouden wordt met druk) en als bij gelijke druk warmte aan water wordt toegevoerd, dan gaat al deze warmte als energie in het water zitten.</Par>
			</>
		},
	},
]
