# Figures within Step-Wise

The figures directory has all functionalities to use figures within Step-Wise. There are various types of figures.

## Figure

The most basic component is the [Figure](./Figure.js) component. If you want to display any figure on Step-Wise, it must be wrapped in the Figure component. (Many of the tools below automatically do so internally.) Important properties to give are:

- `aspectRatio` (default `0.75`): the aspect ratio (height divided by width) of the figure.
- `maxWidth` (default `undefined`): a maximum width in px. The value `undefined` means "use full width when possible".

An example usage is
```
<Figure><img ... /></Figure>
```

## Drawing

When you want to manually (through a script) draw a figure, then use the [Drawing](./Drawing/) component. This allows you to dynamically render images based on parameters.

## Plot

A `Plot` is a `Drawing` with automatically added axes and other useful utilities. See the [Plot](./Plot/) documentation for further information.
