import React, { useState } from "react";
import { PiChartBarLight } from "react-icons/pi";
import { GiTrade } from "react-icons/gi";
import { RiEarthFill } from "react-icons/ri";
import styles from "styles/ui.module.css";

export default function ButtonGroup() {
  const [image, setImage] = useState(1);

  const buttons = [
    { id: 1, icon: <PiChartBarLight />, text: "Intuitive Analytics" },
    { id: 2, icon: <GiTrade />, text: "OverView" },
    { id: 3, icon: <RiEarthFill />, text: "Domain Authentication" },
  ];

  const images = {
    1: "/pic2.png",
    2: "/pic1.png",
    3: "/pic3.png",
  };

  return (
    <>
      <div className="my-10 flex flex-col lg:flex-row items-center justify-between w-full p-6 lg:p-0">
        {buttons.map(({ id, icon, text }) => (
          <button
            key={id}
            onClick={() => setImage(id)}
            className={`${styles.animated_button} ${
              image === id ? styles.animated_buttonActive : ""
            } flex justify-start items-center my-4 lg:my-0 w-full lg:w-[300px]`}
          >
            <span className="h-[30px] px-2 mx-2 rounded-lg border border-gray-600 flex justify-center items-center">
              {icon}
            </span>
            {text}
          </button>
        ))}
      </div>

      <div className="w-full relative h-[300px] md:h-[600px] mx-auto flex justify-center items-center p-10 md:p-0">
        <img
          src={images[image]}
          alt="feature"
          className="object-contain w-full h-full"
          style={{ objectFit: "contain" }}
        />
      </div>
    </>
  );
}
