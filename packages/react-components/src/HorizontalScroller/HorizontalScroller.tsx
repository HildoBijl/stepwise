import { type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode, useState } from 'react'
import { alpha, Box } from '@mui/material'

import { getEventClientPosition } from '@step-wise/browser-utils'
import { clamp } from '@step-wise/js-utils'
import { useElementMeasurement, useElementSize, useEventListener } from '@step-wise/react-utils'

export interface HorizontalScrollerProps {
	readonly children: ReactNode
	readonly edgePadding?: number
	readonly scrollbarOverlay?: boolean
}

export function HorizontalScroller({ children, edgePadding = 0, scrollbarOverlay = false }: HorizontalScrollerProps) {
	const [container, setContainer] = useState<HTMLDivElement | null>(null)
	const [contents, setContents] = useState<HTMLDivElement | null>(null)
	const [scrollPosition, setScrollPosition] = useState(0)
	const [scrollbarGrabPosition, setScrollbarGrabPosition] = useState<number>()
	const [previousDragPosition, setPreviousDragPosition] = useState<number>()

	const containerWidth = useElementSize(container)?.width ?? 0
	const measuredContentsWidth = useElementMeasurement(contents, element => element.scrollWidth) ?? 0
	const active = measuredContentsWidth > containerWidth
	const contentsWidth = measuredContentsWidth + (active ? 2 * edgePadding : 0)
	const visibleFraction = active ? containerWidth / contentsWidth : 1
	const draggingScrollbar = scrollbarGrabPosition !== undefined
	const draggingContents = previousDragPosition !== undefined

	const getPointerFraction = (event: PointerEvent) => {
		const bounds = container?.getBoundingClientRect()
		if (!bounds || bounds.width === 0) return 0
		return (event.clientX - bounds.left) / bounds.width
	}
	const applyScrollbarPosition = (pointerFraction: number, grabPosition: number) => {
		setScrollPosition(clamp((pointerFraction - grabPosition * visibleFraction) / (1 - visibleFraction), 0, 1))
	}
	const startScrollbarDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
		if (!active) return
		const pointerFraction = getPointerFraction(event.nativeEvent)
		const thumbStart = scrollPosition * (1 - visibleFraction)
		const thumbEnd = thumbStart + visibleFraction
		const grabPosition = pointerFraction >= thumbStart && pointerFraction <= thumbEnd
			? (pointerFraction - thumbStart) / visibleFraction
			: 0.5
		setScrollbarGrabPosition(grabPosition)
		applyScrollbarPosition(pointerFraction, grabPosition)
	}
	const updateScrollbarDrag = (event: PointerEvent) => {
		if (!active || scrollbarGrabPosition === undefined) return
		applyScrollbarPosition(getPointerFraction(event), scrollbarGrabPosition)
	}
	const endScrollbarDrag = () => setScrollbarGrabPosition(undefined)

	const startContentsDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
		if (active && event.pointerType !== 'mouse') setPreviousDragPosition(getEventClientPosition(event.nativeEvent).x)
	}
	const updateContentsDrag = (event: PointerEvent) => {
		if (!active || previousDragPosition === undefined) return
		const pointerPosition = getEventClientPosition(event).x
		setScrollPosition(position => clamp(position + (pointerPosition - previousDragPosition) / (containerWidth - contentsWidth), 0, 1))
		setPreviousDragPosition(pointerPosition)
	}
	const endContentsDrag = () => setPreviousDragPosition(undefined)
	const handleScrollbarKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		const directions: Partial<Record<string, number>> = { ArrowLeft: -0.1, ArrowRight: 0.1, PageUp: -0.9, PageDown: 0.9 }
		if (event.key === 'Home' || event.key === 'End') {
			event.preventDefault()
			setScrollPosition(event.key === 'Home' ? 0 : 1)
			return
		}
		const change = directions[event.key]
		if (change === undefined) return
		event.preventDefault()
		setScrollPosition(position => clamp(position + change, 0, 1))
	}

	const browserWindow = typeof window === 'undefined' ? null : window
	useEventListener('pointermove', updateScrollbarDrag, browserWindow)
	useEventListener(['pointerup', 'pointercancel'], endScrollbarDrag, browserWindow)
	useEventListener('pointermove', updateContentsDrag, browserWindow, { passive: true })
	useEventListener(['pointerup', 'pointercancel'], endContentsDrag, browserWindow, { passive: true })

	const scrollbarHeight = '0.5rem'
	return <Box ref={setContainer} className="horizontalScroller" sx={theme => ({
		borderRadius: '0.25rem',
		marginBottom: scrollbarOverlay ? 0 : `-${scrollbarHeight}`,
		overflow: 'hidden',
		paddingBottom: scrollbarOverlay ? 0 : scrollbarHeight,
		position: 'relative',
		transition: `background ${theme.transitions.duration.standard}ms`,
		...(draggingScrollbar ? { userSelect: 'none', WebkitTapHighlightColor: 'transparent' } : {}),
		...(active ? {
			[draggingScrollbar || draggingContents ? '&' : '&:hover']: {
				background: alpha(theme.palette.primary.main, 0.05),
				'& > .horizontalScrollerScrollbar': { opacity: 1 },
			},
		} : {}),
	})}>
		<Box
			ref={setContents}
			className="horizontalScrollerContents"
			onPointerDown={startContentsDrag}
			sx={{
				padding: '1px',
				touchAction: active ? 'pan-y' : 'auto',
				transform: active ? `translateX(${edgePadding - scrollPosition * (contentsWidth - containerWidth)}px)` : 'none',
			}}>
			{children}
		</Box>
		{active ? <Box
			className="horizontalScrollerScrollbar"
			onKeyDown={handleScrollbarKeyDown}
			onPointerDown={startScrollbarDrag}
			role="scrollbar"
			aria-orientation="horizontal"
			aria-valuemax={100}
			aria-valuemin={0}
			aria-valuenow={Math.round(scrollPosition * 100)}
			tabIndex={0}
			sx={theme => ({
				background: alpha(theme.palette.primary.main, 0.2),
				borderRadius: '0.25rem',
				bottom: 0,
				cursor: 'pointer',
				height: scrollbarHeight,
				opacity: 0,
				position: 'absolute',
				transition: `opacity ${theme.transitions.duration.standard}ms`,
				width: '100%',
			})}>
			<Box sx={theme => ({
				background: alpha(theme.palette.primary.main, 0.8),
				borderRadius: '0.25rem',
				height: scrollbarHeight,
				left: `${scrollPosition * (1 - visibleFraction) * 100}%`,
				position: 'absolute',
				width: `${visibleFraction * 100}%`,
			})} />
		</Box> : null}
	</Box>
}
