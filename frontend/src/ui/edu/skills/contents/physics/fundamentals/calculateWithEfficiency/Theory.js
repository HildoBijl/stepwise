import React from 'react'

import { FloatUnit } from 'step-wise/inputTypes/FloatUnit'

import { Head, Par, List, M, BM, Term, Info, Warning } from 'ui/components'

const p80 = new FloatUnit('80%')
const p100 = new FloatUnit('100%')
const p0p8 = p80.setUnit('')

export default function Component() {
	return <>
		<Par>Vaak willen we weten hoe "efficiënt" een systeem of apparaat werkt. De maatstaaf daarvoor is het zogenaamde rendement. Hier bekijken we hoe dat werkt.</Par>

		<Head>Het rendement: nuttig gedeeld door invoer</Head>
		<Par>Een systeem of apparaat heeft altijd iets dat erin gaat. Voor een apparaat is dat vaak een energiestroom, bijvoorbeeld elektriciteit. Ook heeft het systeem/apparaat een doel: wat het moet bereiken. Voor een apparaat is dit ook vaak een vorm van energie. Voor bijvoorbeeld een waterkoker is dit de nuttig toegevoerde warmteenergie.</Par>
		<Par>De verhouding tussen deze twee waarden - het nuttige gedeeld door de invoer - is het <Term>rendement</Term>, geschreven via het Griekse symbool <M>\eta</M> (spreek uit: eta). Simpel gezegd geldt <BM>\eta = \frac(\rm nuttig)(\rm invoer).</BM> De uitkomst kan als kommagetal of als percentage geschreven worden. Als de formule een waarde van <M>{p0p8}</M> geeft, dan zeg je ook wel dat het rendement <M>{p80}</M> is. Rekenen doe je echter altijd met het kommagetal; je rekent nooit met percentages.</Par>
		<Info>Als je met rendement rekent, dan kun je elke eenheid gebruiken die je wilt, zolang je boven en onder in de breuk maar dezelfde eenheid gebruikt. Bijvoorbeeld via energie <M>\eta = \frac(E_(nuttig))(E_(invoer)),</M> of via vermogen (energie per seconde) <M>\eta = \frac(P_(nuttig))(P_(invoer)),</M> of zelfs met geld, mensen, of welke eenheid dan ook.</Info>
		<Warning>Een rendement kan nooit groter dan <M>{p100}</M> zijn. Immers, je kunt nooit meer energy of soortgelijk nuttig gebruiken dan dat je er origineel instopt. ("Nuttig" is kleiner dan "invoer".) Krijg je toch een rendement dat groter is? Dan heb je waarschijnlijk de twee waarden per ongeluk omgewisseld.</Warning>

		<Head>Met rendement rekenen: de stappen</Head>
		<Par>Vaak wil je een rendement uitrekenen. Je volgt dan de volgende stappen.</Par>
		<List useNumbers={true} items={[
			<>Bepaal de invoer van het systeem: wat gaat erin?</>,
			<>Bepaal de nuttige uitvoer van het systeem: wat levert het op? Controleer dat deze waarde inderdaad kleiner is dan de invoer.</>,
			<>Gebruik de formule <M>\eta = \frac(E_(nuttig))(E_(invoer))</M> of soortgelijk om het rendement te berekenen.</>,
		]} />
		<Par>In sommige gevallen is het rendement al bekend, maar wil je juist een invoerwaarde of een nuttige waarde berekenen. In dit zijn de stappen hetzelfde, maar moet je tussendoor nog de vergelijking voor <M>E_(nuttig)</M> of <M>E_(invoer)</M> oplossen.</Par>
	</>
}
