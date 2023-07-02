import React from 'react'

import gases from 'step-wise/data/gasProperties'

import { SkillLink } from 'ui/routing'
import { Head, Par, List, M } from 'ui/components'

export default function Component() {
	return <>
		<Par>De specifieke gasconstante is een constante die je vaak nodig hebt bij het rekenen met gassen. Het is belangrijk om deze constante op te kunnen zoeken.</Par>

		<Head>Theorie</Head>
		<Par>De specifieke gasconstante <M>R_s {gases.air.Rs.unit.texWithBrackets}</M> is een constante waarde voor een soort gas. Voor lucht geldt bijvoorbeeld <M>R_s = {gases.air.Rs},</M> maar deze waarde is voor elk gas anders. Daarom heet hij ook de "specifieke" gasconstante.</Par>
		<Par>Het kan handig zijn om in gedachten te houden: hoe zwaarder het gas, hoe lager de specifieke gasconstante. Zo geldt voor waterstof (het lichtste gas) bijvoorbeeld dat <M>R_s = {gases.hydrogen.Rs}</M> terwijl voor koolstofdioxide (een zwaarder gas) <M>R_s = {gases.carbonDioxide.Rs}</M> geldt.</Par>
		<Par>De specifieke gasconstante is (hoewel de naam anders aangeeft) niet volledig constant. Hij fluctueert licht met bijvoorbeeld de temperatuur. Je kunt in de praktijk dus licht verschillende waarden tegenkomen. Denk aan een procent meer of minder.</Par>

		<Head>Hoe het werkt</Head>
		<Par>Als je de specifieke gasconstante nodig hebt, dan zoek je deze altijd op. Er zijn hier tal van mogelijkheden.</Par>
		<List items={[
			<>In de <SkillLink tab="references">bijlage bij deze vaardigheid</SkillLink>. Zie het tabblad rechtsboven.</>,
			<>In een thermodynamicaboek. Vaak vind je in de bijlage wel een tabel "Eigenschappen van gassen" of soortgelijk.</>,
			<>Online. Zoek in dit geval bij voorkeur in het Engels. Bijvoorbeeld "specific gas constant air" om de specifieke gasconstante van lucht op te zoeken.</>,
		]} />
	</>
}
