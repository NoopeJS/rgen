import React from "react";
import { ModuleComponentJSX } from "@noopejs/react-gen/ModuleComponent";
import "./home.style.css";

ModuleComponentJSX("HomeModule", HomeComponent);
function HomeComponent({ message }: { message?: string }) {
  return (
    <div className="home">
      <img src="/favicon.svg" alt="logo" className="logo" />
      <code className="message">{message}</code>
    </div>
  );
}
export default HomeComponent;
