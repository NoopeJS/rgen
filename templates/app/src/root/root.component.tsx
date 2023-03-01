import React from "react";
import { RootComponentProps } from "@noopejs/react-gen";
import "./root.style.css";
import { ModuleClass } from "@noopejs/react-gen/Module";

const RootComponent: React.FC<RootComponentProps> = ({
  modules,
  appName,
}: RootComponentProps) => {
  return (
    <div className={appName}>
      {modules.map((module: ModuleClass, i: number) => (
        <div key={i}>{module.renderComponent()}</div>
      ))}
    </div>
  );
};

export default RootComponent;
