import React from 'react';

interface FloatingLabelInputProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  error?: string;
  required?: boolean;
  autoComplete?: string;
  children?: React.ReactNode;
  className?: string;
}

export const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  id,
  label,
  type,
  value,
  onChange,
  icon,
  error,
  required = false,
  autoComplete,
  children,
  className = ''
}) => {
  return (
    <div className={`relative group ${className}`}>
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 peer-focus:text-blue-400 z-10">
          {React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5 text-white/50 peer-focus:text-blue-400" })}
        </div>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder=" "
        className={`peer w-full py-4 bg-white/10 border-2 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-0 transition-all duration-300 ${icon ? 'pl-12' : 'px-4'} ${children ? 'pr-12' : 'pr-4'} ${error ? 'border-red-500/70 focus:border-red-500' : 'border-white/20 focus:border-blue-500'}`}
        required={required}
        autoComplete={autoComplete}
      />
      <label htmlFor={id} className={`absolute top-4 text-white/60 transition-all duration-300 pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-xs peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs bg-black/80 backdrop-blur-sm px-1 rounded-md ${icon ? 'left-12 peer-focus:left-10 peer-[:not(:placeholder-shown)]:left-10' : 'left-4 peer-focus:left-3 peer-[:not(:placeholder-shown)]:left-3'} ${error ? 'text-red-400 peer-focus:text-red-400' : 'peer-focus:text-blue-400'}`}>
        {label}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1 ml-2 animate-fade-in-fast">{error}</p>}
    </div>
  );
};