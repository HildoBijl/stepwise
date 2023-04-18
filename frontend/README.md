# Step-Wise front-end

The front-end folder contains everything related to displaying the app. Anything related rendering, language or else is in this folder.

## Techniques used

The front-end app is set up using the following techniques.

- The set-up is based on the [create-react-app](https://github.com/facebook/create-react-app) tool. As components we use functions implementing [Hooks](https://reactjs.org/docs/hooks-intro.html).
- For routing the [React Router](https://reactrouter.com/) package is applied, although we have extended it a bit with our own pathing tool. (See the file `src/ui/routing.js` for details.)
- State management is done using default React functions. No state management system like Redux is applied. Instead, we extensively use [React Contexts](https://reactjs.org/docs/context.html).
- For icons, buttons and other components we use the [Material UI](https://material-ui.com/) library with a few of our [own components](./src/ui/components/).
- For styling we apply [JSS](https://cssinjs.org/). This result in a [good coupling with Material UI](https://material-ui.com/styles/basics/).

This results in an efficient and easily extendable set-up.

## Contents

There are only two subfolders.

- Any public files, like downloads, are in the [public](./public) folder. Not much exciting stuff happening here.
- The actual contents are in the [src (source)](./src) directory. Check it out to learn more.
