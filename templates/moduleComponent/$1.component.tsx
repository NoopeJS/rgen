import React from "react";
import { ModuleComponentJSX } from "@noopejs/react-gen/ModuleComponent";
import "./$1.style.css";

ModuleComponentJSX("$2Module", $2Component);
function $2Component({ message }: { message?: string }) {
  return (
    <div className="$1">
      <img src="/favicon.svg" alt="logo" className="logo" />
      <code className="message">{message}</code>
    </div>
  );
}
export default $2Component;
