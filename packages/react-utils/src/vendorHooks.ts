import { type RefObject } from 'react'
import usePreviousImport from '@react-hook/previous'
import useResizeObserverImport from '@react-hook/resize-observer'
import useSizeImport from '@react-hook/size'

export const usePrevious = usePreviousImport as unknown as {
	<T>(value: T, initialValue: T): T
	<T>(value: T): T | undefined
}

export const useResizeObserver = useResizeObserverImport as unknown as (
	target: HTMLElement | RefObject<HTMLElement | null> | null | undefined,
	callback: () => void,
) => unknown

export const useSize = useSizeImport as unknown as (
	target: HTMLElement | RefObject<HTMLElement | null> | null,
	options?: { initialWidth: number, initialHeight: number },
) => [number, number]
