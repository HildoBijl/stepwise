# Keyboard

Step-Wise has an internal keyboard for input fields. This makes it suitable for use on smartphones, and it also helps users type in special characters like `°C`, `e^x` or `sqrt(x)`.


## Keyboard settings

When an input field wants the keyboard to pop up, it should provide (upon registration to the `FieldController`) appropriate keyboard settings. These keyboard settings are a plain object `{ ... }` with three important (types of) parameters.

An example of `keyboardSettings`, that are for instance used by the `FloatUnitInput` field, are the following.

```
keyboardSettings = {
	keySettings: { Backspace: false, ArrowLeft: false, ArrowUp: false, ... },
	float: { positive: false, allowPower: true },
	unit: {},
	tab: 'float',
}
```

In this object there are three important (types of) parameters.

- `keySettings`: these settings work by key and indicate that that key is (currently, given the situation) not accessible. For instance, if the cursor is all the way on the left, then `ArrowLeft` is set to `false` to disable that key.
- `layoutSettings`: for each possible keyboard type/layout (think of `int`, `float`, `unit`, `textUnit`, `greek`, `basicMath`, `textMath`) there may be a parameter. If the parameter is present, the corresponding keyboard layout is visible as a tab and may be used. The object itself may contain further settings for the given keyboard layout. For instance, by setting `positive: true` the keyboard layout may for instance decide to not display a minus sign button at all, because it won't be used anyway.
- `tab`: which keyboard layout does the input field currently want to display? The user can always change keyboard layouts by clicking on the appropriate tab, but this gives the currently shown keyboard. For instance, when the user goes from the `float` part of an input field to the `unit` part, by moving the cursor, it's nice if the `unit` keyboard tab also automatically pops up.

By providing the right keyboard layout, and by adjusting it appropriately to the situation, the user-friendliness of the input field can be significantly improved.


## Setting up new keyboard layouts

Do you want to create a new keyboard layout? Then check out the [KeyboardLayout](keyboards/KeyboardLayout.js) file and the currently existing [keyboard types](keyboards/types/) implementing this keyboard layout to see how it works. Try to adjust them to whatever format seems suitable for your own wishes.
