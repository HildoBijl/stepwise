import React from 'react'
import { SvgIcon } from '@mui/material'

export function Books(props) {
	// First the five horizontal'ish lines (top to bottom), then the left curves, then the right curves, and then the filled-in shapes (book title and page marker).
	return (
		<SvgIcon {...props}>
			<path d="M 2.55 7.11 l 10.26 -4.38 l 9.78 2.22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />

			<path d="M 22.59 4.95 l -9.3 4.32 l -10.92 -2.28" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
			<path d="M 22.59 8.95 l -9.3 4.32 l -10.92 -2.28" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
			<path d="M 22.59 12.95 l -9.3 4.32 l -10.92 -2.28" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
			<path d="M 22.59 16.95 l -9.3 4.32 l -10.92 -2.28" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />

			<path d="M 2.49 10.99 c -1 -0.4 -1.7 -1.5 -1.4 -2.4 c 0.3 -0.9 1.2 -1.4 2.18 -1.14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
			<path d="M 2.49 14.99 c -1 -0.4 -1.7 -1.5 -1.4 -2.4 c 0.3 -0.9 1.2 -1.4 2.18 -1.24" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
			<path d="M 2.49 18.99 c -1 -0.4 -1.7 -1.5 -1.4 -2.4 c 0.3 -0.9 1.2 -1.4 2.18 -1.24" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />

			<path d="M 22.59 8.95 c -0.6 -0.25 -0.6 -1.5 -0.6 -2 c 0 -0.5 0 -1.75 0.6 -2" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" fill="none" />
			<path d="M 22.59 12.95 c -0.6 -0.25 -0.6 -1.5 -0.6 -2 c 0 -0.5 0 -1.75 0.6 -2" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" fill="none" />
			<path d="M 22.59 16.95 c -0.6 -0.25 -0.6 -1.5 -0.6 -2 c 0 -0.5 0 -1.75 0.6 -2" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" fill="none" />

			<path d="M 12.81 4.23 l -1.32 0.6 l 5.58 1.2 l 1.26 -0.6 z" fill="currentColor" />

			<path d="M 9 10 l -3.096 -0.648 c 0 0 -0.36 0.432 -0.36 1.44 c 0 1.008 0 3.816 0 3.816 l 1.44 -1.44 l 1.584 1.944 c 0 0 0 -2.016 0 -3.744 c 0 -1.152 0.432 -1.368 0.432 -1.368 z" fill="currentColor" />
		</SvgIcon>
	)
}
