
import React, { useState } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'sm', className = '' }) => {
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sizeClasses = {
    sm: 'w-10 h-10 rounded-xl text-lg',
    md: 'w-14 h-14 rounded-2xl text-2xl',
    lg: 'w-20 h-20 rounded-3xl text-4xl'
  };

  return (
    <div className={`${sizeClasses[size]} overflow-hidden flex items-center justify-center bg-white dark:bg-slate-800 shadow-xl shadow-blue-500/10 border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:scale-105 active:scale-95 group shrink-0 relative ${className}`}>
      {!imgError ? (
        <img 
          src="/logo.png" 
          alt="Planify" 
          className={`w-full h-full object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setImgError(true);
            setIsLoading(false);
          }}
        />
      ) : null}

      {(imgError || isLoading) && (
        <div className={`absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-black tracking-tighter shadow-inner ${isLoading && !imgError ? 'animate-pulse' : ''}`}>
          P
        </div>
      )}
    </div>
  );
};

export default Logo;
