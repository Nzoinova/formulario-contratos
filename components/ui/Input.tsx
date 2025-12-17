import React, { useRef } from 'react';
import { AlertCircle, Calendar } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  fullWidth, 
  className, 
  required, 
  icon,
  type,
  ...props 
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCalendarClick = () => {
    if (inputRef.current) {
      if (typeof inputRef.current.showPicker === 'function') {
        inputRef.current.showPicker();
      } else {
        inputRef.current.focus();
      }
    }
  };

  const isDate = type === 'date';

  return (
    <div className={`flex flex-col ${fullWidth ? 'col-span-full' : ''} ${className} group`}>
      <label className={`text-sm font-medium mb-2 flex items-center transition-colors duration-200 
        ${error ? 'text-red-600' : 'text-slate-600 group-focus-within:text-nors-primary'}`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {/* Left Icon (Optional prop) */}
        {icon && (
          <div className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none transition-colors duration-200
            ${error ? 'text-red-400' : 'text-slate-400 group-focus-within:text-nors-primary'}`}>
            {icon}
          </div>
        )}
        
        <input
          ref={inputRef}
          type={type}
          className={`w-full py-3 rounded-lg border text-sm transition-all duration-200 ease-in-out
            ${icon ? 'pl-10' : 'pl-4'} 
            ${isDate ? 'pr-12 cursor-pointer' : 'pr-4'}
            placeholder:text-slate-300
            ${error 
              ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
              : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300 focus:border-nors-primary focus:ring-4 focus:ring-nors-primary/10'
            } 
            focus:outline-none shadow-sm`}
          {...props}
        />

        {/* Right Side Icons */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {error ? (
            <div className="text-red-500 animate-in fade-in zoom-in duration-200 pointer-events-none">
              <AlertCircle size={18} />
            </div>
          ) : isDate ? (
            <button
              type="button"
              onClick={handleCalendarClick}
              className="p-1.5 text-slate-400 hover:text-nors-primary hover:bg-slate-100 rounded-md transition-colors"
              title="Abrir Calendário"
            >
              <Calendar size={18} />
            </button>
          ) : null}
        </div>
      </div>
      
      <div className={`overflow-hidden transition-all duration-300 ${error ? 'max-h-6 mt-1.5' : 'max-h-0'}`}>
        <p className="text-xs font-medium text-red-600 flex items-center gap-1">
          {error}
        </p>
      </div>
    </div>
  );
};