import React, { useState } from 'react';
import { ThemeInput } from './components/ThemeInput';
import { TitleSelection } from './components/TitleSelection';
import { OutlineEditor } from './components/OutlineEditor';
import { ContentEditor } from './components/ContentEditor';
import { GenerationStep, OutlineItem } from './types';
import { PencilLine, ListChecks, FileText, FileEdit } from 'lucide-react';

// ダミーデータは変更なし...
const DUMMY_TITLES = {
  'プログラミング': [
    '初心者でもわかる！React入門ガイド2024',
    'ゼロからはじめるReact開発 - 基礎から実践まで',
    '【保存版】React学習ロードマップ：効率的な学習方法',
    '現役エンジニアが教えるReact上達のコツ',
  ],
  '料理': [
    '誰でも作れる！基本の和食レシピ10選',
    '時短で美味しい！忙しい人のための簡単料理ガイド',
    '季節の食材を使った健康レシピ集',
    'プロ直伝！家庭で作る本格和食',
  ],
  'ガーデニング': [
    '初心者向け！ベランダガーデニングの始め方',
    '四季折々の花を楽しむガーデニング入門',
    '狭いスペースでも楽しめる！ミニ菜園の作り方',
    '園芸のプロが教える植物の育て方基礎知識',
  ],
};

const DUMMY_OUTLINES = {
  'プログラミング': [
    { id: '1', title: 'はじめに', level: 1 },
    { id: '2', title: 'Reactの基礎知識', level: 1 },
    { id: '3', title: 'コンポーネントの作成', level: 2 },
    { id: '4', title: 'Hooksの使い方', level: 2 },
    { id: '5', title: '実践的なアプリケーション開発', level: 1 },
    { id: '6', title: 'まとめ', level: 1 },
  ],
  '料理': [
    { id: '1', title: 'はじめに', level: 1 },
    { id: '2', title: '基本の調理器具', level: 1 },
    { id: '3', title: '材料の下準備', level: 2 },
    { id: '4', title: '調理手順', level: 2 },
    { id: '5', title: 'アレンジレシピ', level: 1 },
    { id: '6', title: 'まとめ', level: 1 },
  ],
  'ガーデニング': [
    { id: '1', title: 'はじめに', level: 1 },
    { id: '2', title: '必要な道具', level: 1 },
    { id: '3', title: '土作りの基本', level: 2 },
    { id: '4', title: '植物の選び方', level: 2 },
    { id: '5', title: '日々の手入れ', level: 1 },
    { id: '6', title: 'まとめ', level: 1 },
  ],
};

const STEPS = [
  { id: 'theme', label: 'テーマ入力', icon: PencilLine },
  { id: 'titles', label: 'タイトル選択', icon: ListChecks },
  { id: 'outline', label: 'アウトライン作成', icon: FileText },
  { id: 'content', label: '本文作成', icon: FileEdit },
] as const;

function App() {
  const [currentStep, setCurrentStep] = useState<GenerationStep>('theme');
  const [theme, setTheme] = useState('');
  const [titles, setTitles] = useState<string[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [content, setContent] = useState('');

  const handleStepClick = (stepId: GenerationStep) => {
    const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);
    const targetStepIndex = STEPS.findIndex(s => s.id === stepId);
    
    // 現在のステップより前のステップのみクリック可能
    if (targetStepIndex < currentStepIndex) {
      setCurrentStep(stepId);
    }
  };

  // その他のハンドラー関数は変更なし...
  const handleThemeSubmit = (theme: string) => {
    setTheme(theme);
    const category = Object.keys(DUMMY_TITLES).find(key => 
      theme.toLowerCase().includes(key.toLowerCase())
    ) || 'プログラミング';
    setTitles(DUMMY_TITLES[category]);
    setCurrentStep('titles');
  };

  const handleTitleSelect = (title: string) => {
    setSelectedTitle(title);
    const category = Object.keys(DUMMY_OUTLINES).find(key => 
      theme.toLowerCase().includes(key.toLowerCase())
    ) || 'プログラミング';
    setOutline(DUMMY_OUTLINES[category]);
    setCurrentStep('outline');
  };

  const handleRegenerateTitles = () => {
    setTitles([...titles].sort(() => Math.random() - 0.5));
  };

  const handleOutlineChange = (newOutline: OutlineItem[]) => {
    setOutline(newOutline);
  };

  const handleOutlineApprove = () => {
    setCurrentStep('content');
    setContent(`# ${selectedTitle}

## はじめに
${theme}に関する記事です。
このガイドでは、基礎から実践的な内容まで、ステップバイステップで解説していきます。

## 本編
${outline.map(item => 
  item.level === 1 ? `\n### ${item.title}\n` : `- ${item.title}\n`
).join('')}

## まとめ
以上が${theme}についての基本的な解説でした。
この記事を参考に、実践してみてください。`);
  };

  const handleRegenerateOutline = () => {
    setOutline([...outline].sort(() => Math.random() - 0.5));
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleRegenerateContent = () => {
    handleOutlineApprove();
  };

  const handleSaveContent = () => {
    console.log('Content saved:', {
      theme,
      title: selectedTitle,
      outline,
      content,
    });
    alert('記事を保存しました！');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">ブログ記事作成支援</h1>
        </div>
      </header>

      <div className="fixed top-16 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isPast = STEPS.findIndex(s => s.id === currentStep) > STEPS.findIndex(s => s.id === step.id);
              const isClickable = STEPS.findIndex(s => s.id === step.id) < STEPS.findIndex(s => s.id === currentStep);
              
              return (
                <div key={step.id} className="flex items-center">
                  {index > 0 && (
                    <div 
                      className={`h-1 w-16 mx-2 ${
                        isPast ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                  <button
                    onClick={() => handleStepClick(step.id)}
                    disabled={!isClickable}
                    className={`flex flex-col items-center ${
                      isActive ? 'text-blue-600' : 
                      isPast ? 'text-blue-600' : 
                      'text-gray-400'
                    } ${
                      isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                    }`}
                  >
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isActive ? 'bg-blue-100' : 
                        isPast ? 'bg-blue-50' : 
                        'bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="mt-2 text-sm font-medium">{step.label}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 pt-36">
        <main className="max-w-7xl mx-auto p-6 bg-gray-50">
          {currentStep === 'theme' && (
            <ThemeInput onSubmit={handleThemeSubmit} />
          )}
          
          {currentStep === 'titles' && (
            <TitleSelection
              titles={titles}
              selectedTitle={selectedTitle}
              onSelect={handleTitleSelect}
              onRegenerate={handleRegenerateTitles}
            />
          )}

          {currentStep === 'outline' && (
            <OutlineEditor
              outline={outline}
              onOutlineChange={handleOutlineChange}
              onApprove={handleOutlineApprove}
              onRegenerate={handleRegenerateOutline}
            />
          )}

          {currentStep === 'content' && (
            <ContentEditor
              content={content}
              onContentChange={handleContentChange}
              onRegenerate={handleRegenerateContent}
              onSave={handleSaveContent}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;