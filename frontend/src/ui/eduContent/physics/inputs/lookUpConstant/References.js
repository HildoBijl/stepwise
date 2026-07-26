import React from 'react'

import { upperFirst } from '@step-wise/utils'
import { c, g, R, e, k, G } from '@step-wise/physics-data'

import { Translation, useTextTranslator } from 'i18n'
import { Par, Table, M } from 'ui/components'

export const tableValues = {
	c: { symbol: 'c', value: c, name: 'the speed of light' },
	g: { symbol: 'g', value: g, name: 'the gravitational acceleration on Earth' },
	R: { symbol: 'R', value: R, name: 'the universal gas constant' },
	e: { symbol: 'e', value: e, name: 'the (elementary) charge of an electron' },
	k: { symbol: 'k', value: k, name: 'the Boltzmann constant' },
	G: { symbol: 'G', value: G, name: 'the universal gravitational constant' },
}

export function References() {
	const translate = useTextTranslator()
	return <>
		<Par><Translation entry="intro">A few examples of common physical constants are shown in the table below.</Translation></Par>
		<Table
			sx={{
				'& .col0': { minWidth: '160px' },
			}}
			colHeads={[
				<Translation entry="header.description">Description</Translation>,
				<Translation entry="header.symbol">Symbol</Translation>,
				<Translation entry="header.value">Value</Translation>,
			]}
			fields={Object.keys(tableValues).map(key => [
				upperFirst(translate(tableValues[key].name, `constants.${key}`)),
				<M>{tableValues[key].symbol}</M>,
				<M>{tableValues[key].value}</M>,
			])}
		/>
	</>
}
