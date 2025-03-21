import React from 'react';
import { ListChecks } from 'lucide-react';

interface TitleSelectionProps {
  titles: string[];
  selectedTitle: string | null;
  onSelect: (title: string) => void;
  onRegenerate: () => void;
}

export function TitleSelection({ titles, selectedTitle, onSelect, onRegenerate }: TitleSelectionProps) {
  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <ListChecks className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">タイトル候補</h2>
        </div>
        <div className="space-y-3">
          {titles.map((title, index) => (
            <button
              key={index}
              onClick={() => onSelect(title)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedTitle === title
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {title}
            </button>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onRegenerate}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            タイトルを再生成
          </button>
        </div>
      </div>
    </div>
  );
}