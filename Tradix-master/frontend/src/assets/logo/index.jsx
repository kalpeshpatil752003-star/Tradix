import React from 'react';

const Logo = (props) => {
  const { margin } = props;

  return (
    <a href="/" className={`flex items-center pl-2.5 ${margin}`}>
      <span
        className="self-center text-xl font-bold whitespace-nowrap dark:text-white"
        style={{
          fontFamily: 'Amulya, sans-serif',
          fontWeight: 700, // optional, just for clarity
        }}
      >
        TRADIX
      </span>
    </a>
  );
};

export default Logo;
