import { CharString } from '../TextInput'

export function Float({ value, cursor }) {
	const { number, power } = value
	const showPower = power !== '' || (cursor?.part === 'power')
	return <>
		<span className="number">
			<CharString str={number} cursor={cursor?.part === 'number' && cursor.cursor} />
		</span>
		{!showPower ? null : <span className="tenPowerContainer">
			<span className="char times">⋅</span>
			<span className="char ten">10</span>
			<span className="power">
				<CharString str={power} cursor={cursor?.part === 'power' && cursor.cursor} />
			</span>
		</span>}
	</>
}
