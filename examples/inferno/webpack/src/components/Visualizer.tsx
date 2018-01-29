/*
 * This is example of Inferno functional component
 * Functional components provide great performance but does not have state
 */

import './Visualizer.styl'

export function Visualizer({ number: number }) {
  return (
    <div styleName="test" className="visualizer">
      {number}
    </div>
  );
}
