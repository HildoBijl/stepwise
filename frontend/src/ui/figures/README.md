# Figures within Step-Wise

The figures directory has all functionalities to use figures within Step-Wise. There are various types of figures.

## Image

If you want to include just a simple image, then it's best to use the [Image](./Image.js) component. This puts the image centered on the page, as is desired for most pages.
```
import SomeImage from 'ui/images/someImage.png'
function someComponent() {
	return <Image src={SomeImage} maxWidth={500} maxHeight={300} />
}
```

## Figure

If you want to create an image yourself with HTML components, then use the [Figure](./Figure.js) component. (Many of the tools below automatically do so internally.) Important properties to give are:

- `aspectRatio` (default `0.75`): the aspect ratio (height divided by width) of the figure. This will be applied, regardless of whether the given components fit inside this shape.
- `maxWidth` (default `undefined`): a maximum width in px. The value `undefined` means "use full width when possible".

An example usage is
```
function someComponent() {
	return <Figure maxWidth={500}><SomeOtherComponents /></Figure>
}
```

## Drawing

When you want to manually (through a script) draw a figure, then use the [Drawing](./Drawing/) component. This allows you to dynamically render images based on parameters. See the accompanying documentation for further details.

## Plot

A `Plot` is a `Drawing` with automatically added axes and other useful utilities. See the [Plot](./Plot/) documentation for further information.
