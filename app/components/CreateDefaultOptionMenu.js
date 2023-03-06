import React, { useState, useContext, useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import PropTypes from "prop-types";

function CreateDefaultOptionMenu(props) {
  function getMainDivStyle() {
    if (props.mainStyle === undefined) {
      return {
        paddingTop: "30px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      };
    }
    return props.mainStyle;
  }

  return (
    <div className={props.className} style={getMainDivStyle()}>
      <span
        className="form-group d-flex"
        style={{
          fontSize: "18px",
          fontVariant: "all-small-caps",
          marginBottom: "10px",
        }}
      >
        {props.name}:
      </span>
      <select
        name={props.name}
        id={props.name}
        style={{
          backgroundColor: "#588b8b",
        }}
        onChange={(e) => props.onChange(e.target.value)}
      >
        {props.optionElements()}
      </select>
    </div>
  );
}

CreateDefaultOptionMenu.propTypes = {
  name: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  optionElements: PropTypes.func.isRequired,
};

export default CreateDefaultOptionMenu;
