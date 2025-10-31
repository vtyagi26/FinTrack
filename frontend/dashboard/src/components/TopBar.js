import React from "react";
import Menu from "./Menu";

const TopBar = () => {
  return (
    <div
      className="topbar-container container-fluid border-bottom position-relative"
      style={{ zIndex: 1055 }}
    >
      <div className="row align-items-center justify-content-end px-3 py-2 m-0">
        <div className="col-12 text-end p-0 position-relative">
          <Menu />
        </div>
      </div>
    </div>
  );
};

export default TopBar;