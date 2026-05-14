import React from 'react';
import './MyButton.css'

const MyButton = ({ 
  children, 
  type = 'button', 
  onClick, 
  className = '',
  variant = 'primary',
  disabled = false,
  ...props 
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`my-button my-button-${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default MyButton;