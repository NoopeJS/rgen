import React from "react";
import { ModuleComponentJSX } from "@noopejs/react-gen/ModuleComponent";
import "./$kebabed.style.css";

ModuleComponentJSX("$capitalizedModule", $capitalizedComponent);
function $capitalizedComponent({ message }: { message?: string }) {
  return (
    <div className="$kebabed">
      <code className="message">{message}</code>
    </div>
  );
}
export default $capitalizedComponent;
