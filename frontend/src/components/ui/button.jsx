import React from "react";

export function Button({ children, ...props }) {
  return (
    <button
      {...props}
      className={
        "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full transition " +
        (props.className || "")
      }
    >
      {children}
    </button>
  );
} 