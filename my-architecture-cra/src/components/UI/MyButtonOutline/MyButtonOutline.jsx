import React from 'react';
import './MyButtonOutline.css';

const MyButtonOutline = (props) => {
  const { children, type = 'button', onClick, className = '', disabled = false, style, ...rest } = props;
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`my-button-outline ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </button>
  );
};

export default MyButtonOutline;