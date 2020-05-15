import React from 'react';
import './App.scss';
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link
} from 'react-router-dom';
import { Home } from './Home';
import { Exercises } from './Exercises';
import logo from './logo.svg';

const ROUTES = {
  HOME: '/',
  EXERCISES: '/exercises',
};

function App() {
  return (
    <div className='App'>
      <header className='App-header'>
        <Router>
          <>
            <nav className='Navigation'>
              <img src={logo} className='App-logo' alt='logo' />
              <ul>
                <li>
                  <Link to={ROUTES.HOME}>Home</Link>
                </li>
                <li>
                  <Link to={ROUTES.EXERCISES}>Exercises</Link>
                </li>
              </ul>
            </nav>

            <Switch>
              <Route path={ROUTES.EXERCISES}>
                <Exercises />
              </Route>
              <Route path={ROUTES.HOME}>
                <Home />
              </Route>
            </Switch>
          </>
        </Router>
      </header>
    </div>
  );
}

export default App;
