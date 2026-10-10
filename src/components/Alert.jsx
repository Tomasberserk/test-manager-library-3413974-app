import React from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

export function Alert({ error, message, onClose }) {
  if (!error && !message) return null;

  const isError = Boolean(error);
  const title = isError ? (error.code ? `Error: ${error.code}` : 'Error') : 'Éxito';
  const text = isError ? (error.message || 'Ocurrió un error inesperado.') : message;
  const details = isError && Array.isArray(error.details) ? error.details : [];

  return (
    <div className={`p-4 rounded-xl border mb-6 flex items-start gap-3 relative transition-all ${
      isError 
        ? 'bg-red-50/80 border-red-200 text-red-900' 
        : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
    }`}>
      {isError ? (
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
      ) : (
        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
      )}
      <div className="flex-1 text-sm">
        <h4 className="font-semibold">{title}</h4>
        <p className="mt-0.5">{text}</p>
        {details.length > 0 && (
          <ul className="mt-2 list-disc list-inside space-y-1 text-xs text-red-700">
            {details.map((d, i) => (
              <li key={i}>
                <span className="font-mono font-medium">{d.field}</span>: {d.issue}
              </li>
            ))}
          </ul>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 hover:bg-black/5 rounded-lg text-gray-500 hover:text-gray-700 transition"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
