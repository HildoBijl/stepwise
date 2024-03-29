# Step-Wise front-end UI source code

This UI folder contains all the content to render Step-Wise. There are a few important folders/files. In inheritance order (where later folders may import from earlier folders, but not vice versa) we have the following.

## Fundamental settings and functionalities

- [theme](./theme.js) has all general style for the website. This theme is used in various styling functions.
- [routingTools](./routingTools.js) has tools related to the routing of the app. It has components like Links and such.
- [lang](./lang/) has supported functionalities related to displaying various languages. This will be extended in the future, when multiple languages will be added to Step-Wise.

## General-purpose components

- [images](./images/) simply contains images that can be loaded onto the website.
- [components](./components/) are general-purpose components that can be included anywhere in the website. This is very broad: from paragraphs and tables to react flow management components like error boundaries.
- [figures](./figures/) is the image drawing library. Use it to generate dynamically rendered images. This includes shapes, plots and more. Everything can also be automated or made interactive.
- [form](./form/) has all components related to handling data inside a Form: the `FieldController` managing field focus and tabs, the `Keyboard` that pops up on input fields, the `Form` itself that tracks input data, as well as the `FeedbackProvider` that tracks feedback in a form.
- [inputs](./inputs/) has all input fields that can be placed inside a form. After all, the specific input fields for every application is one of the things that makes the app intuitive to use.

## Contents

- [eduTools](./eduTools/) has all components related to the functionality of educational purposes. Think of tools to load exercises, recommend skills, and so forth.
- [eduContents](./eduContents/) has all components related to educational contents. This includes the theory pages and exercises corresponding to skills.
- [pages](./pages/) has various pages that can be rendered. These pages then display some of the earlier mentioned components.
- [admin](./admin/) has pages and tools related to the administrator functionalities of the website.

## Displaying tools

- [routing](./routing.js) contains the website page tree: which URL points to which page component. It imports various Pages.
- [layout](./layout/) takes the routes and wraps a nice layout (with header bar, menu, etcetera) around the route given by the user through the URL.
