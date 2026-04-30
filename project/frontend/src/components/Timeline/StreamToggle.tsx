import React from 'react';
import { ApartmentOutlined } from '@ant-design/icons';

interface StreamToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const StreamToggle: React.FC<StreamToggleProps> = ({ checked, onChange }) => {
  return (
    <div className="flex items-center justify-end mb-4">
      <button
        onClick={() => onChange(!checked)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all border ${
          checked
            ? 'bg-[#8B4513] text-white border-[#8B4513]'
            : 'bg-white/80 text-[#8B7355] border-[#D4A574] hover:border-[#8B4513]'
        }`}
      >
        <ApartmentOutlined />
        {checked ? '隐藏源流脉络' : '显示源流脉络'}
      </button>
    </div>
  );
};

export default StreamToggle;
