import React from 'react';
import {Link, navigate} from 'react-page';

export default class Frontend extends React.Component {

  _click(e) {
  	e.preventDefault();
    console.log('clicked!');
  }

  render() {

    return (
      <div id="Frontend">
      	<button onClick={this._click}>click aqui</button>
      </div>
    );
  }
}
