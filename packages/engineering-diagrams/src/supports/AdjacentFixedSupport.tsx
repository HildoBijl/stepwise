import { type FixedSupportProps, FixedSupport } from './FixedSupport.tsx'

export function AdjacentFixedSupport(props: FixedSupportProps) {
	return <FixedSupport positionFactor={1} {...props} />
}
