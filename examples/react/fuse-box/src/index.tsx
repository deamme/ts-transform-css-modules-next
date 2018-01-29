import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Incrementer } from "./components/Incrementer";

import './index.styl'

const container = document.getElementById("app");

class MyComponent extends React.Component<any, any> {
  private tsxVersion: number;

  constructor(props, context) {
    super(props, context);

    this.tsxVersion = 2.48; /* This is typed value */
  }

  public render() {
    return (
      <div>
        <h1>{`Welcome to Inferno TSX version ${this.tsxVersion}`}</h1>
        <Incrementer name={"Crazy button"} />
      </div>
    );
  }
}

ReactDOM.render(<MyComponent />, container);
