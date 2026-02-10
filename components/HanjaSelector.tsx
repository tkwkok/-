
import React, { useState } from 'react';
import { COMMON_HANJA } from '../constants';
import { HanjaItem } from '../types';

interface Props {
  onSelect: (item: HanjaItem) => void;
  onClose: () => void;
  title: string;
}

const HanjaSelector: React.FC<Props> = ({ onSelect, onClose, title }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filtered = COMMON_HANJA.filter(item => 
    item.k.includes(searchTerm) || item.h === searchTerm
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <h3 className="font-bold text-stone-700">{title} 한자 선택</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-red-800 text-xl font-bold">&times;</button>
        </div>
        
        <div className="p-4">
          <input 
            autoFocus
            type="text"
            placeholder="한글 음을 입력하세요 (예: 서, 빈, 재)"
            className="w-full p-3 bg-stone-100 rounded-xl outline-none focus:ring-2 focus:ring-[#8b2e2e]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-4 gap-2">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onSelect(item)}
                className="flex flex-col items-center justify-center p-2 bg-stone-50 border border-transparent hover:border-[#8b2e2e] hover:bg-red-50 rounded-xl transition-all"
              >
                <span className="text-2xl font-bold mb-1">{item.h}</span>
                <span className="text-[10px] text-stone-500">{item.k}</span>
                <span className="text-[9px] text-[#8b2e2e] font-bold">{item.s}획</span>
              </button>
            ))
          ) : (
            <div className="col-span-4 py-10 text-center text-stone-400 text-sm">
              검색된 한자가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HanjaSelector;
