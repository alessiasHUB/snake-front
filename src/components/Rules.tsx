import React from "react";

import AppleRed from "../img/apple-red.png";
import AppleGreen from "../img/apple-green.png";
import AppleYellow from "../img/apple-yellow.png";
import AppleBlue from "../img/apple-blue.png";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IRulesProps {}

const Rules: React.FunctionComponent<IRulesProps> = (props) => {
  return (
    <>
      <div className="rules">
        <h2>Rules</h2>
        <p><img height={50}src={AppleRed} alt=""/> normal mode</p>
        <p><img height={50}src={AppleGreen} alt=""/> wall travel</p>
        <p><img height={50}src={AppleBlue} alt=""/> ghost mode</p>
        <p><img height={50}src={AppleYellow} alt=""/> invincible mode</p>

      </div>
    </>
  );
};

export default Rules;
