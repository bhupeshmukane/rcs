import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  title, 
  subtitle,
  actions,
  ...props 
}) => {
  return (
    <div 
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            {title && (
              <h3 className="text-lg font-bold text-slate-900">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-slate-600">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex space-x-2">
              {actions}
            </div>
          )}
        </div>
      )}

      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
