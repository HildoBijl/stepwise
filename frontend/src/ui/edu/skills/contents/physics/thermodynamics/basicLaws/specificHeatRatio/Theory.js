import React from 'react'

import { Float } from 'step-wise/inputTypes/Float'
import gases from 'step-wise/data/gasProperties'

import { SkillLink } from 'ui/routing'
import { Head, Par, List, M, Term } from 'ui/components'

export default function Component() {
	return <>
		<Par>Net als dat elk gas een <SkillLink skillId="specificGasConstant">specifieke gasconstante</SkillLink> heeft, heeft elk gas ook een <M>k</M>-waarde. Ook deze moet je op kunnen zoeken.</Par>

		<Head>Theorie</Head>
		<Par>De <Term><M>k</M>-waarde</Term> is afhankelijk van het soort gas. Voor lucht geldt bijvoorbeeld <M>k = {gases.air.k}.</M> De <M>k</M>-waarde wordt ook wel de verhouding van soortelijke warmten genoemd. Er geldt namelijk <M>k = \frac(c_p)(c_v),</M> waar <M>c_v</M> en <M>c_p</M> de <SkillLink skillId="specificHeats">soortelijke warmten</SkillLink> zijn. (Waarschijnlijk leer je hier later nog meer over.) Omdat <M>c_v</M> en <M>c_p</M> beiden dezelfde eenheid hebben, heeft <M>k</M> geen eenheid. Het is puur een verhouding.</Par>
		<Par>Het is interessant om te weten dat de <M>k</M>-waarde te maken heeft met de vorm van de moleculen. De edele gassen die met één atoom een molecuul vormen (bijvoorbeeld helium, neon of argon) hebben een <M>k</M>-waarde van rond de <M>5/3 \approx {new Float('1,67')}.</M> De reactieve gassen die met twee atomen een molecuul vormen (bijvoorbeeld zuurstof O<sub>2</sub> of stikstof N<sub>2</sub>) hebben ongeveer <M>k \approx 7/5 = {new Float('1,4')}.</M> Voor eenvoudige koolstoflinks (bijvoorbeeld koolstofdioxide CO<sub>2</sub> of methaan CH<sub>4</sub>) geldt grofweg <M>k \approx 9/7 \approx {new Float('1,29')}.</M></Par>

		<Head>Hoe het werkt</Head>
		<Par>Als je een <M>k</M>-waarde nodig hebt, dan zoek je deze altijd op, net als bij de specifieke gasconstante.</Par>
		<List items={[
			<>In de <SkillLink tab="references">bijlage bij deze vaardigheid</SkillLink>. Zie het tabblad rechtsboven.</>,
			<>In een thermodynamicaboek. Vaak vind je in de bijlage wel een tabel "Eigenschappen van gassen" of soortgelijk.</>,
			<>Online. Zoek in dit geval bij voorkeur in het Engels. Bijvoorbeeld "specific heat ratio air" om de verhouding van soortelijke warmten van lucht op te zoeken.</>,
		]} />
	</>
}
