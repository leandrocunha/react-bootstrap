import React from 'react';
import ReactDOM from 'react-dom';
import Page from 'react-page';

import Frontend from './components/Frontend';
import Main from './components/Main';

var render = RootComponent => ReactDOM.render(<RootComponent />,
  document.getElementById('app'));

Page.set(render)
 .with(Main)
  .on(
    'app',
    '/',
    Frontend
  )
  .run();