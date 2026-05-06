# CAS Interpreter

The CAS interpreter turns a value from the [math-input-value](../../../../math-input-value/) package (an `ExpressionInputValue`) into an `ExpressionNode`. This is an involved process. This ReadMe loosely outlines the steps.

1. **Interpret brackets**: Find pairs of matching brackets. Take the contents between the brackets and throw them in the original interpreter.
2. **Interpret sums**: Find pluses/minuses/plus-minuses. Take the contents between them and throw them in the interpreter, starting from this step.
3. **Interpret products**: Find product symbols *. Take the contents between them and throw them in the interpreter, starting from this step.
4. **Remaining elements**: This includes both strings and elements.
  - **Strings**: Turn something like "a2.3bc" into the product of "a", 2.3, "b" and "c".
	- **Elements**: Turn elements that were already special objects in the `ExpressionInputValue` into their `ExpressionNode` counterparts. This include:
	  - **Accents**: Turn `hat(x)` into a variable.
		- **Subscripts/superscripts**: Pull subscripts into the variable preceding it. Turn superscripts into powers.
		- **Special functions**: Turn fractions, square roots, etcetera in the corresponding CAS equivalent.

Once this is done, the `ExpressionInputValue` has turned into an `ExpressionNode`. It can be wrapped in an `Expression` object to give it all the functionalities of the CAS.
