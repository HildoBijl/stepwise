import React from 'react'

import { TabPages } from 'ui/layout/tabs'

export default function Test() {

	const pages = {
		theory: <div>
			<p>Theory page!</p>
			<p>Theory page!</p>
			<p>Theory page!</p>
			<p>Theory page!</p>
			<p>Theory page!</p>
			<p>Theory page!</p>
			<p>Theory page!</p>
			<p>Theory page!</p>
			<p>Theory page!</p>
			<p>Theory page!</p>
			<p>Theory page!</p>
			<p>Theory page!</p>
			<p>Theory page!</p>
			<p>Theory page!</p>
			<p>Theory page!</p>
			<p>Theory page!</p>
			<p>Theory page!</p>
			<p>Theory page!</p>
			<p>Theory page!</p>
			<p>Theory page!</p>
			<p>Theory page!</p>
			<p>Theory page!</p>
			<p>Theory page!</p>
			<p>Theory page!</p>
			<p>Theory page!</p>
			<p>Theory page!</p>
			<p>Theory page!</p>
			<p>Theory page!</p>
			<p>Theory page!</p>
		</div>,
		summary: <div>Summary here.</div>,
		practice: <div>Here will be an exercise.</div>,
		references: <div>Some references or so.</div>,
		meta: <div>And here the meta-info.</div>,
	}

	return <TabPages pages={pages} initialPage="summary" />
}
