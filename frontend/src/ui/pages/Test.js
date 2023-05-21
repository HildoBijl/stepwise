import React, { Fragment, useEffect, useRef, useState } from 'react'
import { useTheme, makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { pageContainerStyle } from 'ui/theme'
import { Par, Head, M, BM } from 'ui/components'

import CAS from 'step-wise/CAS'

import { Float } from 'step-wise/inputTypes/Float'
import { FloatUnit } from 'step-wise/inputTypes/FloatUnit'


import { firstOf, lastOf, spread } from 'step-wise/util/arrays'
import { Transformation } from 'step-wise/geometry'

import { useAnimation } from 'util/react'
import { Drawing, drawingComponents, useBoundsBasedTransformationSettings, Element } from 'ui/components/figures'
import { usePlotTransformationSettings, Axes, MouseLines } from 'ui/components/figures/Plot'


// core version + navigation, pagination modules:
// import Swiper, { Scrollbar } from 'swiper'
// import Swiper and modules styles
// import 'swiper/css'
// import 'swiper/css/scrollbar'

import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import Container from '@material-ui/core/Container'

import { useTabs } from 'ui/layout/tabs'

// // import Swiper bundle with all modules installed
// import Swiper from 'swiper/bundle';

// // import styles bundle
// import 'swiper/css/bundle';

window.CAS = CAS

window.Float = Float
window.FloatUnit = FloatUnit

// // init Swiper:
// const swiperOptions = {
// 	modules: [Scrollbar],

// 	autoHeight: true, // Adjust to height of active page.
// 	simulateTouch: false, // Do not slide on mouse drags, only on touch drags.

// 	// And if we need scrollbar
// 	scrollbar: {
// 		el: '.swiper-scrollbar',
// 	},

// 	initialSlide: 2,
// }

const useStyles = makeStyles((theme) => ({
	swiper: {
		width: '100%',
		height: '100%',

		'& .swiper-slide': {
			paddingTop: '200px',
			textAlign: 'center',
		},

		'& .ss1': {
			background: '#ffcccc',
			height: '800px',
		},
		'& .ss2': {
			background: '#ccffcc',
			height: '600px',
		},
		'& .ss3': {
			background: '#ccccff',
			height: '1000px',
		},
	},
	root: {
	},
	tab: {
		backgroundColor: theme.palette.secondary.main,
	},
	pageContainer: {
		...pageContainerStyle,
	},
}))

function TabPanel({ children, value, index, className, ...other }) {
	const classes = useStyles()
	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			className={clsx(classes.pageContainer, className)}
			{...other}
		>
			{value === index && <div>{children}</div>}
		</div>
	)
}

export default function Test() {
	const context = useTabs(['summary', 'meta', 'theory', 'references'])

	const eq = CAS.asEquation('E=mc^2')
	eq.left.color = '881111'
	eq.right.color = '00bb44'
	eq.color = '4488ff'

	const classes = useStyles()

	// Tabs stuff
	const theme = useTheme()
	const [value, setValue] = useState(0)
	const handleChange = (event, newValue) => {
		setValue(newValue);
	}
	const handleChangeIndex = (index) => {
		setValue(index);
	}

	// // ToDo: put in separate hook useSwiper.
	// const swiperRef = useRef()
	// useEffect(() => {
	// 	console.log('Initiating')
	// 	const swiper = new Swiper(`.${classes.swiper}`, swiperOptions)
	// 	swiper.init()
	// 	swiper.on('activeIndexChange', (swiper) => console.log("Shifting to " + swiper.activeIndex))
	// 	swiperRef.current = swiper
	// 	console.log(swiperRef.current)
	// }, [classes])
	// const swiper = swiperRef.current
	// console.log(swiper)

	return <>
		<div className={classes.root}>
			<AppBar position="static" color="secondary">
				<Container maxWidth={theme.appWidth}>
					<Tabs
						value={value}
						onChange={handleChange}
						variant="fullWidth"
						TabIndicatorProps={{ style: { backgroundColor: theme.palette.background.main } }} // Color of the active tab indicator line.
					>
						<Tab label="Theory" id="full-width-tab-0" />
						<Tab label="Practice" id="full-width-tab-1" />
						<Tab label="References" id="full-width-tab-2" />
					</Tabs>
				</Container>
			</AppBar>
			<Container maxWidth={theme.appWidth}>
				<TabPanel value={value} index={0} dir={theme.direction}>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
					<p>Item One</p>
				</TabPanel>
				<TabPanel value={value} index={1} dir={theme.direction}>
					<p>Item Two</p>
					<p>Item Two</p>
					<p>Item Two</p>
					<p>Item Two</p>
					<p>Item Two</p>
					<p>Item Two</p>
					<p>Item Two</p>
					<p>Item Two</p>
					<p>Item Two</p>
					<p>Item Two</p>
					<p>Item Two</p>
					<p>Item Two</p>
					<p>Item Two</p>
					<p>Item Two</p>
					<p>Item Two</p>
					<p>Item Two</p>
					<p>Item Two</p>
					<p>Item Two</p>
					<p>Item Two</p>
					<p>Item Two</p>
				</TabPanel>
				<TabPanel value={value} index={2} dir={theme.direction}>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
					<p>Item Three</p>
				</TabPanel>
			</Container>
		</div >
	</>

	// return <>
	// 	<div className={clsx(classes.swiper, 'swiper')}>
	// 		<div className="swiper-wrapper">
	// 			<div className="swiper-slide ss1">Slide 1</div>
	// 			<div className="swiper-slide ss2">Slide 2</div>
	// 			<div className="swiper-slide ss3">Slide 3</div>
	// 		</div>
	// 		<div className="swiper-scrollbar"></div>
	// 	</div>
	// 	<div onClick={() => swiper.slideTo(0)}>Button 1</div>
	// 	<div onClick={() => swiper.slideTo(1)}>Button 2</div>
	// 	<div onClick={() => swiper.slideTo(2)}>Button 3</div>
	// </>

	// return (
	// 	<>
	// 		<Par>Dit is een testpagina. Hij wordt gebruikt om simpele dingen te testen en te kijken hoe ze werken. Vaak staat er willekeurige zooi op.</Par>
	// 		<Head>Tests</Head>
	// 		<BM>x=\frac(-b\pm\sqrt[2](b^2-4ac))(2a).</BM>
	// 		<BM>{eq}</BM>
	// 	</>
	// )
}
