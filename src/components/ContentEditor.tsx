import React, { useState, useRef } from 'react';
import { FileEdit, RotateCcw, Save, Download, Edit, Eye, Columns, ChevronDown, Loader2 } from 'lucide-react';

interface ContentEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onRegenerate: () => void;
  onSave: () => void;
  isLoading?: boolean;
}

type ViewMode = 'split' | 'editor' | 'preview';
type ExportFormat = 'markdown' | 'pdf' | 'html';

export function ContentEditor({ 
  content, 
  onContentChange, 
  onRegenerate, 
  onSave,
  isLoading = false 
}: ContentEditorProps) {
  const [editableContent, setEditableContent] = useState(content);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const handleContentChange = (newContent: string) => {
    setEditableContent(newContent);
    onContentChange(newContent);
  };

  const handleExport = (format: ExportFormat) => {
    setShowExportMenu(false);
    
    switch (format) {
      case 'markdown':
        exportMarkdown();
        break;
      case 'pdf':
        exportPDF();
        break;
      case 'html':
        exportHTML();
        break;
    }
  };

  const exportMarkdown = () => {
    const blob = new Blob([editableContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'article.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportHTML = () => {
    // マークダウンをHTMLに変換
    const htmlContent = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ブログ記事</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1, h2, h3 { margin-top: 1.5em; }
    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.2em; }
    pre {
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }
    code { font-family: monospace; }
    blockquote {
      border-left: 3px solid #ccc;
      padding-left: 10px;
      color: #666;
    }
  </style>
</head>
<body>
  ${renderMarkdownToHTML(editableContent)}
</body>
</html>
    `.trim();

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'article.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    // 注意: クライアントサイドでのPDF生成は実際には外部ライブラリが必要です
    // この実装は、印刷ダイアログを開くシンプルな代替案です
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('ポップアップがブロックされています。PDF出力するには、ポップアップを許可してください。');
      return;
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>ブログ記事</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1, h2, h3 { margin-top: 1.5em; }
    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.2em; }
    pre {
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }
    code { font-family: monospace; }
    blockquote {
      border-left: 3px solid #ccc;
      padding-left: 10px;
      color: #666;
    }
    @media print {
      body { max-width: 100%; }
    }
  </style>
</head>
<body>
  ${renderMarkdownToHTML(editableContent)}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
    `.trim();

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // マークダウンをHTMLに変換するヘルパー関数
  const renderMarkdownToHTML = (text: string) => {
    return text
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
      .replace(/^- (.*?)$/gm, '<li>$1</li>')
      .replace(/<li>(.*?)<\/li>/g, function(match) {
        return '<ul>' + match + '</ul>';
      })
      .replace(/<\/ul><ul>/g, '')
      .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
      .replace(/\n\n/g, '<br><br>');
  };

  const renderMarkdown = (text: string) => {
    // より効果的なマークダウンパース
    let html = text
      // 見出し
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      // 強調
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // コードブロックとインラインコード
      .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // リンクと画像
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
      // 箇条書き（改善）
      .replace(/^- (.*?)$/gm, '<li>$1</li>');
    
    // 箇条書きリストをul要素で囲む
    let inList = false;
    const lines = html.split('\n');
    html = lines.map(line => {
      if (line.startsWith('<li>')) {
        if (!inList) {
          inList = true;
          return '<ul>' + line;
        }
        return line;
      } else if (inList) {
        inList = false;
        return '</ul>' + line;
      }
      return line;
    }).join('\n');
    
    if (inList) {
      html += '</ul>';
    }
    
    // 引用
    html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');
    
    // 段落（空行で区切られたテキスト）
    // すでにHTMLタグで囲まれていない行のみを<p>で囲む
    const paragraphs = html.split('\n\n');
    html = paragraphs.map(p => {
      // すでにHTMLタグで始まっていなければ<p>で囲む
      if (!/^<\w+[^>]*>/.test(p.trim())) {
        return `<p>${p}</p>`;
      }
      return p;
    }).join('\n\n');
    
    return <div 
      dangerouslySetInnerHTML={{ __html: html }} 
      className="prose prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:my-4 prose-li:my-1 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded"
    />;
  };

  // クリックイベントのハンドラー
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileEdit className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">記事本文</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('editor')}
                disabled={isLoading}
                className={`flex items-center gap-1 px-3 py-2 ${
                  viewMode === 'editor' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Edit className="w-4 h-4" />
                <span>エディター</span>
              </button>
              <button
                onClick={() => setViewMode('preview')}
                disabled={isLoading}
                className={`flex items-center gap-1 px-3 py-2 ${
                  viewMode === 'preview' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Eye className="w-4 h-4" />
                <span>プレビュー</span>
              </button>
              <button
                onClick={() => setViewMode('split')}
                disabled={isLoading}
                className={`flex items-center gap-1 px-3 py-2 ${
                  viewMode === 'split' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Columns className="w-4 h-4" />
                <span>分割表示</span>
              </button>
            </div>
            <button
              onClick={onRegenerate}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <RotateCcw className="w-5 h-5" />
              <span>本文を再生成</span>
            </button>
            <button
              onClick={onSave}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Save className="w-5 h-5" />
              <span>保存</span>
            </button>
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isLoading}
                className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Download className="w-5 h-5" />
                <span>エクスポート</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleExport('markdown')}
                      className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                    >
                      マークダウン (.md)
                    </button>
                    <button
                      onClick={() => handleExport('html')}
                      className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                    >
                      HTML (.html)
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                    >
                      PDF (.pdf)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 border border-gray-300 rounded-md bg-gray-50">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-xl text-gray-600">本文を生成しています...</p>
            <p className="text-gray-500 mt-2">少々お待ちください（1〜2分かかる場合があります）</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'split' ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {(viewMode === 'editor' || viewMode === 'split') && (
              <div className="h-[600px] border border-gray-300 rounded-md overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
                  <h3 className="text-sm font-medium text-gray-700">エディター</h3>
                </div>
                <textarea
                  value={editableContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="w-full h-[calc(600px-36px)] p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="記事の本文を入力してください..."
                />
              </div>
            )}
            
            {(viewMode === 'preview' || viewMode === 'split') && (
              <div className="h-[600px] border border-gray-300 rounded-md overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
                  <h3 className="text-sm font-medium text-gray-700">プレビュー</h3>
                </div>
                <div className="h-[calc(600px-36px)] p-4 overflow-auto prose prose-lg max-w-none">
                  {renderMarkdown(editableContent)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}