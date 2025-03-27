import React, { useState } from 'react';
import { PencilLine, Loader2 } from 'lucide-react';

interface ThemeInputProps {
  onSubmit: (theme: string) => void;
  isLoading?: boolean;
}

export function ThemeInput({ onSubmit, isLoading = false }: ThemeInputProps) {
  const [theme, setTheme] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (theme.trim()) {
      onSubmit(theme.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <PencilLine className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">ブログテーマを入力</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-2">
              書きたいブログ記事のテーマを入力してください
            </label>
            <textarea
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="例: プログラミング初心者向けのReact入門ガイド"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!theme.trim() || isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                タイトル候補を生成中...
              </span>
            ) : (
              'タイトル候補を生成'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}