import React, { ReactNode } from 'react';

export type TagColor = 'green' | 'yellow' | 'red';
export type ButtonVariant = 'dark' | 'light' | 'black';

export interface TaskCardProps {
  icon: React.ElementType;
  title: string;
  tagText: string;
  tagColor: TagColor;
  details: { label: string; value: string }[];
  bottomLeftContent: ReactNode;
  buttonText: string;
  buttonVariant: ButtonVariant;
  buttonIcon?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const tagColorClasses: Record<TagColor, string> = {
  green: 'bg-green-500 text-white',
  yellow: 'bg-yellow-400 text-gray-900',
  red: 'bg-red-500 text-white',
};

const buttonVariantClasses: Record<ButtonVariant, string> = {
  dark: 'bg-[#ECECEC] text-gray-900',
  black: 'bg-black text-white',
  light: 'bg-gray-100 text-gray-900',
};

export const TaskCard: React.FC<TaskCardProps> = ({
  icon: Icon,
  title,
  tagText,
  tagColor,
  details,
  bottomLeftContent,
  buttonText,
  buttonVariant,
  buttonIcon,
  className = '',
  style,
}) => {
  return (
    <div 
      className={`bg-white rounded-[20px] sm:rounded-[28px] px-4 sm:px-6 py-4 sm:py-5 shadow-sm flex flex-col w-full ${className}`}
      style={style}
    >
      {/* Row 1: Icon + title and colored pill tag */}
      <div className="flex items-center justify-between pb-4 sm:pb-5 border-b border-black/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
            <Icon size={20} className="text-gray-700" />
          </div>
          <h3 className="text-lg sm:text-xl font-medium text-gray-900">{title}</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${tagColorClasses[tagColor]}`}>
          {tagText}
        </div>
      </div>

      {/* Row 2: Detail grid */}
      <div className="flex items-center gap-4 py-4 sm:py-5 border-b border-black/10">
        {details.map((detail, index) => (
          <div 
            key={index} 
            className={`flex flex-col gap-1 ${index === 2 ? 'flex-[0.5] max-w-[120px]' : 'flex-1'}`}
          >
            <span className="text-xs sm:text-sm text-gray-500">{detail.label}</span>
            <span className="text-sm sm:text-base font-medium text-gray-900 truncate">{detail.value}</span>
          </div>
        ))}
      </div>

      {/* Row 3: Bottom content + action button */}
      <div className="flex items-center justify-between pt-4 sm:pt-5 mt-auto">
        <div className="flex items-center gap-2">
          {bottomLeftContent}
        </div>
        <button 
          className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-sm sm:text-base font-medium transition-transform hover:scale-105 active:scale-95 ${buttonVariantClasses[buttonVariant]}`}
        >
          {buttonText}
          {buttonIcon && <span className="ml-1">{buttonIcon}</span>}
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
