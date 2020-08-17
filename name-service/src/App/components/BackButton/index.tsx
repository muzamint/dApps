import React from "react";
import { useHistory } from "react-router-dom";
import backArrow from "./assets/backArrow.svg";
import "./BackButton.less";

interface BackButtonProps {
  readonly path?: string;
}

function BackButton({ path }: BackButtonProps): JSX.Element {
  const history = useHistory();
  const goBack = path ? () => history.push(path) : history.goBack;

  return <img src={backArrow} alt="Back arrow" className="BackButton" onClick={goBack} />;
}

export default BackButton;