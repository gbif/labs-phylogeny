import React from 'react';
import ReactDOM from 'react-dom';

import * as serviceWorker from './serviceWorker';
import './index.css';
import Root from './Root';
import { Router, Route, Switch } from 'react-router-dom';
import history from './history';
import ContextProvider from "./components/ContextProvider";

ReactDOM.render(
  <ContextProvider>
    <Router history={history}>
      <Switch>
        <Route path="/" component={Root}/>
      </Switch>
    </Router>
  </ContextProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
