import React from 'react';
import './Card.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  hoverEffect = false, 
  className = '', 
  ...props 
}) => {
  const hoverClass = hoverEffect ? 'card-hover' : '';

  return (
    <div className={`card ${hoverClass} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};
