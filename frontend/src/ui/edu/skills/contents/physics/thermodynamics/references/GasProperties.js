import React from 'react'

import gasProperties from 'step-wise/data/gasProperties'
import { firstToUpperCase } from 'step-wise/util/strings'

import { Dutch } from 'ui/lang/gases'
import { Head, Par } from 'ui/components/containers'
import Table from 'ui/components/Table'
import { M } from 'ui/components/equations'

const gasKeys = Object.keys(gasProperties).sort((a, b) => Dutch[a].localeCompare(Dutch[b]))

export default function Component() {
	return <>
		<Head>Eigenschappen van gassen</Head>
		<Table
			colHeads={['Gas', <M>R_s \left[{gasProperties.air.Rs.unit}\right]</M>, <M>k \left[-\right]</M>, <M>c_v \left[{gasProperties.air.cv.unit}\right]</M>, <M>c_p \left[{gasProperties.air.cp.unit}\right]</M>]}
			fields={gasKeys.map(gas => [
				firstToUpperCase(Dutch[gas]),
				<M>{gasProperties[gas].Rs.setUnit(gasProperties.air.Rs.unit).float}</M>,
				<M>{gasProperties[gas].k.setUnit(gasProperties.air.k.unit).float}</M>,
				<M>{gasProperties[gas].cv.setUnit(gasProperties.air.cv.unit).float}</M>,
				<M>{gasProperties[gas].cp.setUnit(gasProperties.air.cp.unit).float}</M>,
			])}
		/>
		<Par>Merk op: de bovenstaande eigenschappen zijn niet volledig constant. Ze hangen licht af van onder andere de temperatuur. In de praktijk treden dus lichte variaties op.</Par>
	</>
}
