import React, { useEffect } from "react";
import { preLoaderAnim } from "../../animation";
import "./preloader.css"; // 👈 import the CSS file here
const PreLoader = () => {
  useEffect(() => {
    preLoaderAnim();
  }, []);

  return (
    
    <div className="preloader">
      <div className="texts-container">
        <span>Trade</span>
        <span>Analysis</span>
        <span>Improve</span>
      </div>
    </div>
  );
};

export default PreLoader;
