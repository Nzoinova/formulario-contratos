import React from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
  error?: string;
  fullWidth?: boolean;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ 
  label, 
  options, 
  error, 
  fullWidth, 
  placeholder = "Selecione...", 
  className, 
  required, 
  ...props 
}) => {
  return (
    <div className={`flex flex-col ${fullWidth ? 'col-span-full' : ''} ${className} group`}>
      <label className={`text-sm font-medium mb-2 flex items-center transition-colors duration-200 
        ${error ? 'text-red-600' : 'text-slate-600 group-focus-within:text-nors-primary'}`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <select
          className={`w-full appearance-none px-4 py-3 rounded-lg border text-sm transition-all duration-200 ease-in-out
            ${error 
              ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
              : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300 focus:border-nors-primary focus:ring-4 focus:ring-nors-primary/10'
            } 
            focus:outline-none shadow-sm cursor-pointer pr-10`}
          {...props}
        >
          <option value="" disabled hidden>{placeholder}</option>
          <option value="" className="text-slate-400">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="text-slate-900 py-1">
              {opt}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
          {error ? <AlertCircle size={18} className="text-red-500" /> : <ChevronDown size={16} />}
        </div>
      </div>
      <div className={`overflow-hidden transition-all duration-300 ${error ? 'max-h-6 mt-1.5' : 'max-h-0'}`}>
        <p className="text-xs font-medium text-red-600">
          {error}
        </p>
      </div>
    </div>
  );
};