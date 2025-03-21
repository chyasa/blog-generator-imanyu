import React, { useState } from 'react';
import { FileEdit, RotateCcw, Save, Download } from 'lucide-react';

interface ContentEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onRegenerate: () => void;
  onSave: () => void;
}

export function ContentEditor({ content, onContentChange, onRegenerate, onSave }: ContentEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(content);

  const handleEditToggle = () => {
    if (isEditing) {
      onContentChange(editableContent);
    }
    setIsEditing(!isEditing);
  };

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'article.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileEdit className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">記事本文</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRegenerate}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <RotateCcw className="w-5 h-5" />
              <span>本文を再生成</span>
            </button>
            <button
              onClick={handleEditToggle}
              className={`px-4 py-2 rounded-md transition-colors ${
                isEditing
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isEditing ? '編集を完了' : '編集する'}
            </button>
            <button
              onClick={onSave}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
            >
              <Save className="w-5 h-5" />
              <span>保存</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          {isEditing ? (
            <textarea
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
              className="w-full h-[600px] p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="記事の本文を入力してください..."
            />
          ) : (
            <div className="whitespace-pre-wrap">{content}</div>
          )}
        </div>
      </div>
    </div>
  );
}