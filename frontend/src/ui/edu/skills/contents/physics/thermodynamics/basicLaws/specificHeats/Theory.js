import React from 'react'

import gases from 'step-wise/data/gasProperties'

import { SkillLink } from 'ui/routing'
import { Head, Par, List } from 'ui/components/containers'
import { M, BMList, BMPart } from 'ui/components/equations'

export default function Component() {
	return <>
		<Par>Eerder zagen we dat elk gas een <SkillLink skillId="specificGasConstant">specifieke gasconstante</SkillLink> en een <SkillLink skillId="specificHeatRatio"><M>k</M>-waarde</SkillLink> heeft. Er zijn ook nog de soortelijke warmten <M>c_v</M> en <M>c_p</M>, die je ook op moet kunnen zoeken.</Par>

		<Head>Definities van de soortelijke warmten</Head>
		<Par>Per definitie is <M>c_v</M> de soortelijke warmte bij constant volume: als je een gas met constant volume verwarmt, hoeveel Joule is er dan nodig om één kilogram gas één graad Celsius (of Kelvin) in temperatuur te laten stijgen? Voor lucht is dit bijvoorbeeld <M>c_v = {gases.air.cv}.</M> Soortgelijk is <M>c_p</M> de soortelijke warmte bij constante druk: als je een gas met constante druk verwarmt, hoeveel Joule is er dan nodig om één kilogram gas één graad Celsius (of Kelvin) in temperatuur te laten stijgen? Voor lucht geldt <M>c_p = {gases.air.cp}.</M></Par>
		<Par>Er geldt altijd dat <M>c_p &gt; c_v.</M> Er is dus altijd meer energie nodig om gas bij constante druk te verwarmen dan bij constant volume. Om in te zien waarom, moet je kijken naar wat er gebeurt bij een proces met constante druk. Stel je bijvoorbeeld een hoeveelheid gas voor in een zuiger. De zuiger houdt het gas op constante druk. Als we het gas verwarmen, dan stijgt normaliter de druk. Deze toename in druk duwt de zuiger weg, waardoor de druk weer op de oude waarde komt. Bij het wegdrukken van deze zuiger (bij de expansie van het gas) verricht het gas arbeid. Dit is een vorm van energie die vanuit het gas naar buiten "wegstroomt". Als gevolg hiervan moeten we dus meer energie in het gas stoppen: er is meer warmte nodig om de temperatuur één graad Celsius te laten stijgen.</Par>

		<Head>Links met <M>R_s</M> en <M>k</M></Head>
		<Par>Een gas heeft vier belangrijke constanten: <M>R_s,</M> <M>k,</M> <M>c_v</M> en <M>c_p.</M> Hierbij geldt: als je twee van de vier weet, dan kun je altijd de andere twee berekenen. Er geldt bijvoorbeeld
			<BMList>
				<BMPart>R_s = c_p - c_v,</BMPart>
				<BMPart>k = \frac(c_p)(c_v).</BMPart>
			</BMList>
			Of andersom, als we <M>R_s</M> en <M>k</M> weten, dan kunnen we het bovenstaande omschrijven tot
			<BMList>
				<BMPart>c_v = \frac(R_s)(k-1),</BMPart>
				<BMPart>k = \frac(kR_s)(k-1).</BMPart>
			</BMList>
			Vaak geldt dat je alle vier de eigenschappen van het gas tegelijkertijd opzoekt, en dan is het omrekenen dus niet nodig.
		</Par>

		<Head>Hoe het werkt</Head>
		<Par>Als je de soortelijke warmten van een gas nodig hebt, dan zoek je deze altijd op.</Par>
		<List items={[
			<>In de bijlage van deze app. Zie het tabblad rechtsboven.</>,
			<>In een thermodynamicaboek. Vaak vind je in de bijlage wel een tabel "Eigenschappen van gassen" of soortgelijk.</>,
			<>Online. Zoek in dit geval bij voorkeur in het Engels. Bijvoorbeeld "specific heat at constant volume/pressure air" om de soortelijke warmten van lucht bij constante druk/volume op te zoeken.</>,
		]} />
	</>
}
