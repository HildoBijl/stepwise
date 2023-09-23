# Input

The `Input` object is an object that is implemented by various specific input field types. Effectively all input fields are descendents of it. If you only want to use existing input fields, then ignore this folder.

## Usage/set-up

Inside some type of input field you can use the following set-up.

```
function SomeInputFieldType(options) {
	// Process options.
	const processedOptions = options

	return <Input {...processedOptions}>
		<SomeInputFieldTypeInner />
	</Input>
}

function SomeInputFieldTypeInner() {
	// Use hooks here to obtain information.
	const [FI, setFI] = useInput()

	return <div>Some rendering</div>
}
```

## Hooks

There is a large variety of hooks available. For this, see the files in the [context/hooks/](context/hooks/) folder.
