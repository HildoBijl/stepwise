import React from 'react'

import { FloatUnit } from 'step-wise/inputTypes'

import { Translation } from 'i18n'
import { Head, Par, List, Term, M } from 'ui/components'

const dist = new FloatUnit('2.3 km')
const temp = new FloatUnit('18 °C')

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>Often when making exercises you have to look something up. For instance a physical constant like the speed of light, but it can be pretty much anything. Here we practice looking things up as well as entering these numbers.</Par>
		</Translation>

		<Translation entry="attachments">
			<Head>Attachments</Head>
			<Par>When looking up physical quantities, the default source is the entire internet. However, it may be a bit hard to find the right data, or maybe you encounter websites with deviating or outright incorrect values.</Par>
			<Par>To save you from this frustration, Step-Wise has internal attachments to look up data. Whenever an exercise requires you to look something up, there is always an "Attachments" tab with said data. Browse it to get what you need, and then return to the exercise to use your newfound discovery.</Par>
		</Translation>

		<Translation entry="floatUnitInputs">
			<Head>Input fields for decimal numbers with units</Head>
			<Par>Physical quantities always have a number and a unit. For instance, a distance might be <M>{dist}</M> or a temperature may be <M>{temp}</M>. Without the unit, the number is meaningless.</Par>
			<Par>Entering physical quantities in Step-Wise is easy: we once more have a custom input field. This field has two parts.</Par>
			<List items={[
				<>A <Term>number part</Term>: this is where you enter the number, which may also include a ten-power.</>,
				<>A <Term>unit part</Term>: this is where you enter the unit, as you are used to.</>,
			]} />
			<Par>Each of these two parts has its own internal keyboards, which adjusts automatically as you move from one part to the other. This allows you to easily enter any physical quantity that might come out of your calculations.</Par>
		</Translation>
	</>
}
