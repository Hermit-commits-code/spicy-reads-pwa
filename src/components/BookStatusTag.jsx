import React from "react";
import PropTypes from "prop-types";

const STATUS_LABELS = {
  checkedOut: "Checked Out",
  ownDigital: "Own Digitally",
  ownPhysical: "Own Physically",
};

export default function BookStatusTag({ status, inline }) {
  if (!status || !STATUS_LABELS[status]) return null;
  const style = inline
    ? {
        background: "rgba(30, 41, 59, 0.92)",
        color: "#fff",
        borderRadius: "999px",
        padding: "2px 10px",
        fontSize: "0.8rem",
        fontWeight: 500,
        boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
        whiteSpace: "nowrap",
        maxWidth: "100px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        border: "2px solid #fff",
        display: "inline-block",
      }
    : {
        position: "absolute",
        left: 8,
        bottom: 8,
        top: "auto",
        background: "rgba(30, 41, 59, 0.92)",
        color: "#fff",
        borderRadius: "999px",
        padding: "2px 10px",
        fontSize: "0.8rem",
        fontWeight: 500,
        boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
        zIndex: 10,
        pointerEvents: "none",
        whiteSpace: "nowrap",
        maxWidth: "100px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        border: "2px solid #fff",
      };
  return (
    <div style={style} className="book-status-tag">
      {STATUS_LABELS[status]}
    </div>
  );
}

BookStatusTag.propTypes = {
  status: PropTypes.oneOf(["checkedOut", "ownDigital", "ownPhysical"]),
  inline: PropTypes.bool,
};
