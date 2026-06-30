import React, { forwardRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import './Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isValid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, isValid, className = '', type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
    
    const errorClass = error ? 'input-error shake' : '';
    const validClass = isValid ? 'input-valid' : '';
    
    return (
      <div className={`input-wrapper ${className}`}>
        {label && <label className="input-label">{label}</label>}
        
        <div className="input-container">
          <input
            ref={ref}
            type={inputType}
            className={`input-field ${errorClass} ${validClass}`}
            {...props}
          />
          
          {isPassword && (
            <button 
              type="button"
              className="input-icon-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}

          {!isPassword && isValid && (
            <CheckCircle2 className="input-icon-success scale-pop" size={18} />
          )}

          {!isPassword && error && (
            <AlertCircle className="input-icon-error" size={18} />
          )}
        </div>
        
        {error && <span className="input-error-msg" role="alert">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
