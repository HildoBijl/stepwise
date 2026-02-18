import React from 'react'

import { upperFirst } from 'step-wise/util'
import gasProperties from 'step-wise/data/gasProperties'

import { Dutch } from 'ui/lang/gases'
import { Head, Par, Table, M } from 'ui/components'

const gasKeys = Object.keys(gasProperties).sort((a, b) => Dutch[a].localeCompare(Dutch[b]))

export function GasPropertiesTable() {
	return <>
		<Head>Eigenschappen van gassen</Head>
		<Table
			colHeads={['Gas', <M>R_s {gasProperties.air.Rs.unit.texWithBrackets}</M>, <M>k {gasProperties.air.k.unit.texWithBrackets}</M>, <M>c_v {gasProperties.air.cv.unit.texWithBrackets}</M>, <M>c_p {gasProperties.air.cp.unit.texWithBrackets}</M>]}
			fields={gasKeys.map(gas => [
				upperFirst(Dutch[gas]),
				<M>{gasProperties[gas].Rs.setUnit(gasProperties.air.Rs.unit).float}</M>,
				<M>{gasProperties[gas].k.setUnit(gasProperties.air.k.unit).float}</M>,
				<M>{gasProperties[gas].cv.setUnit(gasProperties.air.cv.unit).float}</M>,
				<M>{gasProperties[gas].cp.setUnit(gasProperties.air.cp.unit).float}</M>,
			])}
		/>
		<Par>Merk op: de bovenstaande eigenschappen zijn niet volledig constant. Ze hangen licht af van onder andere de temperatuur. In de praktijk treden dus lichte variaties op.</Par>
	</>
}
