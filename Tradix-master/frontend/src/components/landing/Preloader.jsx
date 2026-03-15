import React from 'react'
import { preLoaderAnim } from "../animation/index.js";
import { useEffect } from "react";


const Preloader = () => {
    useEffect(() => {
      preLoaderAnim();
    }, []);
    return (
      <div className="preloader">
        <div className="texts-container">
          <span>Developer,</span>
          <span>Curator,</span>
          <span>Vibes.</span>
        </div>
      </div>
    );
  };
  
  

export default Preloader
