# Step-Wise front-end UI source code

This UI folder contains all the content to render Step-Wise. There are a few important folders/files. In inheritance order (where later folders may import from earlier folders, but not vice versa) we have the following.

## Fundamental settings and functionalities

- [cookies](./cookies.js) exports functionalities related to setting/reading cookies.
- [theme](./theme.js) has all general style for the website. This theme is used in various styling functions.
- [lang](./lang/) has supported functionalities related to displaying various languages. This will be extended in the future, when multiple languages will be added to Step-Wise.

## General-purpose components

- [images](./images/) simply contains images that can be loaded onto the website.
- [components](./components/) are general-purpose components that can be included anywhere in the website. This is very broad: from paragraphs and tables to react flow management components like error boundaries.
- [figures](./figures/) is the image drawing library. Use it to generate dynamically rendered images. This includes shapes, plots and more. Everything can also be automated or made interactive.
- [form](./form/) has all components related to input: the Form that tracks input data, as well as the input fields that can be used to get that data.

## Contents

- [edu](./edu/) has all components related to educational purposes. For skills there are theory pages, and for exercises there are the actual exercise components.
- [pages](./pages/) has various pages that can be rendered. These pages then display some of the earlier mentioned components.
- [admin](./admin/) has pages and tools related to the administrator functionalities of the website.

## Displaying tools

- [routing](./routing.js) contains the website page tree: which URL points to which page component. It imports various Pages.
- [layout](./layout/) takes the routes and wraps a nice layout (with header bar, menu, etcetera) around the route given by the user through the URL.
