
import React from 'react';

interface ResultDisplayProps {
  number: number | null;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ number }) => {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
        number !== null ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="relative">
        <span
          key={number}
          className="text-9xl md:text-[200px] font-bold text-white animate-pop-in"
          style={{
            textShadow: '0 0 15px rgba(255, 255, 255, 0.3), 0 0 30px rgba(129, 140, 248, 0.7)',
          }}
        >
          {number}
        </span>
      </div>
      <style>{`
        @keyframes pop-in {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-pop-in {
          animation: pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
};
