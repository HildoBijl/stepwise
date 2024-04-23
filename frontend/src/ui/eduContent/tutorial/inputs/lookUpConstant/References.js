import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import { firstToUpperCase } from 'step-wise/util'
import * as constants from 'step-wise/data/constants'

import { Translation, useTextTranslator } from 'i18n'
import { Par, Table, M } from 'ui/components'

export const tableValues = {
	c: {
		symbol: 'c',
		name: 'the speed of light',
	},
	g: {
		symbol: 'g',
		name: 'the gravitational acceleration on Earth',
	},
	R: {
		symbol: 'R',
		name: 'the universal gas constant',
	},
	e: {
		symbol: 'e',
		name: 'the (elementary) charge of an electron',
	},
	k: {
		symbol: 'k',
		name: 'the Boltzmann constant',
	},
	G: {
		symbol: 'G',
		name: 'the universal gravitational constant',
	},
}

const useStyles = makeStyles((theme) => ({
	table: {
		'& .col0': {
			minWidth: '160px',
		},
	},
}))

export function References() {
	const classes = useStyles()
	const translate = useTextTranslator()
	return <>
		<Par><Translation entry="intro">A few examples of common physical constants are shown in the table below.</Translation></Par>
		<Table className={classes.table}
			colHeads={[
				<Translation entry="header.description">Description</Translation>,
				<Translation entry="header.symbol">Symbol</Translation>,
				<Translation entry="header.value">Value</Translation>,
			]}
			fields={Object.keys(tableValues).map(key => [
				firstToUpperCase(translate(tableValues[key].name, `constants.${key}`)),
				<M>{tableValues[key].symbol}</M>,
				<M>{constants[key]}</M>,
			])}
		/>
	</>
}
