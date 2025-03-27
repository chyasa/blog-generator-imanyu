import React from 'react';
import { ListChecks, Loader2 } from 'lucide-react';

interface TitleSelectionProps {
  titles: string[];
  selectedTitle: string | null;
  onSelect: (title: string) => void;
  onRegenerate: () => void;
  onProceed: () => void;
  isLoading?: boolean;
}

export function TitleSelection({ 
  titles, 
  selectedTitle, 
  onSelect, 
  onRegenerate,
  onProceed,
  isLoading = false 
}: TitleSelectionProps) {
  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <ListChecks className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">タイトル候補</h2>
        </div>
        
        {isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
            <p className="text-gray-600">タイトルを再生成しています...</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {titles.map((title, index) => (
                <button
                  key={index}
                  onClick={() => onSelect(title)}
                  disabled={isLoading}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedTitle === title
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {title}
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={onRegenerate}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                タイトルを再生成
              </button>
              
              <button
                onClick={onProceed}
                disabled={isLoading || !selectedTitle}
                className={`px-4 py-2 rounded-md font-medium ${
                  selectedTitle && !isLoading
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                アウトライン作成へ進む
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}