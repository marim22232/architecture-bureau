import React from 'react';
import './MyTextarea.css';

const MyTextarea = ({ 
  name, 
  placeholder, 
  value, 
  onChange, 
  required = false,
  rows = 4,
  className = '',
  onFocus,
  ...props 
}) => {
  return (
    <textarea
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      rows={rows}
      onFocus={onFocus}
      className={`my-textarea ${className}`}
      {...props}
    />
  );
};

export default MyTextarea;