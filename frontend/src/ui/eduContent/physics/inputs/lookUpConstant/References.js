import React from 'react'

import { upperFirst } from '@step-wise/js-utils'
import { c, g, R, e, k, G } from '@step-wise/physics-data'
import { M } from '@step-wise/math-display'
import { Translation, useTranslation } from '@step-wise/i18n'

import { Par, Table } from 'ui/components'

export const tableValues = {
	c: { symbol: 'c', value: c, name: 'the speed of light' },
	g: { symbol: 'g', value: g, name: 'the gravitational acceleration on Earth' },
	R: { symbol: 'R', value: R, name: 'the universal gas constant' },
	e: { symbol: 'e', value: e, name: 'the (elementary) charge of an electron' },
	k: { symbol: 'k', value: k, name: 'the Boltzmann constant' },
	G: { symbol: 'G', value: G, name: 'the universal gravitational constant' },
}

export function References() {
	return <>
		<Par><Translation id="intro">A few examples of common physical constants are shown in the table below.</Translation></Par>
		<Table
			sx={{
				'& .col0': { minWidth: '160px' },
			}}
			colHeads={[
				<Translation group={['references', 'header']} id="description">Description</Translation>,
				<Translation group={['references', 'header']} id="symbol">Symbol</Translation>,
				<Translation group={['references', 'header']} id="value">Value</Translation>,
			]}
			fields={Object.keys(tableValues).map(key => [
				<ConstantDescription constant={key} />,
				<M>{tableValues[key].symbol}</M>,
				<M>{tableValues[key].value}</M>,
			])}
		/>
	</>
}

function ConstantDescription({ constant }) {
	const description = useTranslation({ group: ['references', 'constants'], id: constant, children: tableValues[constant].name })
	return upperFirst(description)
}
