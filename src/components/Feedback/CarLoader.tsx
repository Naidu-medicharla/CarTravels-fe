import React, { useEffect, useState } from 'react';
import './CarLoader.css';

export interface CarLoaderProps {
  isLoading: boolean;
}

export const CarLoader: React.FC<CarLoaderProps> = ({ isLoading }) => {
  const [show, setShow] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    
    if (isLoading) {
      // Show only if loading takes more than 400ms
      timeout = setTimeout(() => {
        setShow(true);
        setFade(false);
      }, 400);
    } else if (show) {
      // If it was showing, fade it out
      setFade(true);
      timeout = setTimeout(() => {
        setShow(false);
        setFade(false);
      }, 200); // 200ms fade
    }

    return () => clearTimeout(timeout);
  }, [isLoading, show]);

  if (!show) return null;

  return (
    <div className={`car-loader-container ${fade ? 'fade-out' : 'fade-in'}`}>
      <div className="car-loader-bar">
        <div className="car-loader-track"></div>
        <div className="car-loader-vehicle">
          🚗
        </div>
      </div>
    </div>
  );
};
