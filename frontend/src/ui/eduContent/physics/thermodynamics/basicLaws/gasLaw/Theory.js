import React from 'react'

import { Unit } from '@step-wise/physics-core'
import { M, BM } from '@step-wise/math-display'

import { Head, Par, List, Term, Emp } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

const Pa = new Unit('Pa')
const m3 = new Unit('m^3')
const kg = new Unit('kg')
const JpkgK = new Unit('J/kg*K')
const K = new Unit('K')

export default function Component() {
	return <>
		<Par>De gaswet beschrijft de link tussen druk, volume en temperatuur. Als je twee van de drie weet (en als je weet wat voor/hoeveel gas je hebt) dan kun je altijd de derde waarde vinden. Dat maakt de gaswet erg nuttig.</Par>

		<Head>Theorie</Head>
		<Par>De <Term>gaswet</Term> zegt dat <BM>pV = mR_sT.</BM> De symbolen in deze formule betekenen het volgende.</Par>
		<List>
			<List.Item><><M>p {Pa.texWithBrackets}</M> is de druk van het gas.</></List.Item>
			<List.Item><><M>V {m3.texWithBrackets}</M> is het volume van het gas.</></List.Item>
			<List.Item><><M>m {kg.texWithBrackets}</M> is de massa van het gas.</></List.Item>
			<List.Item><><M>R_s {JpkgK.texWithBrackets}</M> is de specifieke gasconstante van het gas. Merk op: deze is per gas verschillend en kun je opzoeken in tabellen.</></List.Item>
			<List.Item><><M>T {K.texWithBrackets}</M> is de temperatuur van het gas.</></List.Item>
		</List>
		<Par>Belangrijk bij de gaswet is om altijd met <Emp>standaard eenheden</Emp> te rekenen. Anders gaat het fout.</Par>

		<Head>De stappen</Head>
		<Par>Bij het gebruik van de gaswet volg je over het algemeen de volgende stappen.</Par>
		<List useNumbers={true}>
			<List.Item><>Zet alle gegeven waarden in standaard eenheden.</></List.Item>
			<List.Item><>Zoek de <SkillLink skillId="specificGasConstant">specifieke gasconstante</SkillLink> van het betreffende gas op.</></List.Item>
			<List.Item><>Los de gaswet <M>pV = mR_sT</M> (een <SkillLink skillId="solveLinearEquation">lineaire vergelijking</SkillLink>) op voor het symbool dat je wilt weten.</></List.Item>
			<List.Item><>Vul waarden in om de betreffende waarde uit te rekenen.</></List.Item>
		</List>
	</>
}
