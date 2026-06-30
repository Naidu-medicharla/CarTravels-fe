import React from 'react';
import './Skeleton.css';

export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width, 
  height, 
  borderRadius 
}) => {
  const style: React.CSSProperties = {
    width,
    height,
    borderRadius,
  };

  return <div className={`skeleton ${className}`} style={style} />;
};
