import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { addOne } from "../utils/math";
import { Visualizer } from "./Visualizer";

interface Props {
  name: string;
}

export class Incrementer extends React.Component<Props, { value: number }> {
  public state = {
    value: 1
  };

  constructor(props, context) {
    super(props, context);
  }

  public doMath = () => {
    this.setState({
      value: addOne(this.state.value)
    });
  };

  public render() {
    // uncomment: example of type verification
    //
    // this.props.name = 1;
    // this.props.bar = 1;

    return (
      <div>
        {this.props.name}
        <button onClick={this.doMath}>Increment</button>
        <Visualizer number={this.state.value + "foobar"} />
      </div>
    );
  }
}
