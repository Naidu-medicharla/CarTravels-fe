import React from 'react';
import './PasswordStrength.css';

export interface PasswordStrengthProps {
  score: number; // 0 to 4
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ score }) => {
  const getSegmentClass = (index: number) => {
    if (score <= index) return 'segment-empty';
    
    // Determine color based on overall score
    switch (score) {
      case 1: return 'segment-red';
      case 2: return 'segment-orange';
      case 3: return 'segment-yellow';
      case 4: return 'segment-green';
      default: return 'segment-empty';
    }
  };

  return (
    <div className="password-strength-container">
      <div className={`strength-segment ${getSegmentClass(0)}`}></div>
      <div className={`strength-segment ${getSegmentClass(1)}`}></div>
      <div className={`strength-segment ${getSegmentClass(2)}`}></div>
      <div className={`strength-segment ${getSegmentClass(3)}`}></div>
    </div>
  );
};
