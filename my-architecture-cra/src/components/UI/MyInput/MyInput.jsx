import React from 'react';
import './MyInput.css';

const MyInput = ({ 
  type = 'text', 
  name, 
  placeholder, 
  value, 
  onChange, 
  required = false,
  className = '',
  ...props 
}) => {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={`my-input ${className}`}
      {...props}
    />
  );
};

export default MyInput;