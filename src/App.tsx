import React, { useState } from 'react';
import { ThemeInput } from './components/ThemeInput';
import { TitleSelection } from './components/TitleSelection';
import { OutlineEditor } from './components/OutlineEditor';
import { ContentEditor } from './components/ContentEditor';
import { GenerationStep, OutlineItem } from './types';
import { PencilLine, ListChecks, FileText, FileEdit } from 'lucide-react';
import { generateTitles, generateOutline, generateContent } from './services/api';

// ダミーデータは変更なし...
const DUMMY_TITLES: Record<string, string[]> = {
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

const DUMMY_OUTLINES: Record<string, OutlineItem[]> = {
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStepClick = (stepId: GenerationStep) => {
    const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);
    const targetStepIndex = STEPS.findIndex(s => s.id === stepId);
    
    // 現在のステップより前のステップのみクリック可能
    if (targetStepIndex < currentStepIndex) {
      setCurrentStep(stepId);
    }
  };

  const handleThemeSubmit = async (theme: string) => {
    setTheme(theme);
    setIsLoading(true);
    setError(null);
    
    try {
      // APIを使用してタイトル候補を生成
      const generatedTitles = await generateTitles(theme);
      
      if (generatedTitles.length === 0) {
        throw new Error('タイトル候補を生成できませんでした。別のテーマを試してください。');
      }
      
      setTitles(generatedTitles);
      setCurrentStep('titles');
    } catch (err) {
      console.error('タイトル生成エラー:', err);
      setError('タイトル候補の生成中にエラーが発生しました。別のテーマを試すか、後でもう一度お試しください。');
      
      // APIエラー時はダミーデータを使用
      const category = Object.keys(DUMMY_TITLES).find(key => 
        theme.toLowerCase().includes(key.toLowerCase())
      ) || 'プログラミング';
      setTitles(DUMMY_TITLES[category]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTitleSelect = (title: string) => {
    // タイトルを選択するだけで、画面遷移はしない
    setSelectedTitle(title);
  };

  // 新しい関数：アウトライン作成ボタンがクリックされたときに呼ばれる
  const handleProceedToOutline = async () => {
    // selectedTitleがnullの場合は何もしない（ボタンはdisabledなので通常は起きない）
    if (!selectedTitle) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // アウトライン画面に遷移
      setCurrentStep('outline');
      
      // APIを使用してアウトライン候補を生成
      const generatedOutline = await generateOutline(theme, selectedTitle);
      
      if (generatedOutline.length === 0) {
        throw new Error('アウトライン候補を生成できませんでした。別のタイトルを試してください。');
      }
      
      setOutline(generatedOutline);
    } catch (err) {
      console.error('アウトライン生成エラー:', err);
      setError('アウトライン候補の生成中にエラーが発生しました。別のタイトルを試すか、後でもう一度お試しください。');
      
      // APIエラー時はダミーデータを使用
      const category = Object.keys(DUMMY_OUTLINES).find(key => 
        theme.toLowerCase().includes(key.toLowerCase())
      ) || 'プログラミング';
      setOutline(DUMMY_OUTLINES[category]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateTitles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // APIを使用してタイトル候補を再生成
      const generatedTitles = await generateTitles(theme);
      
      if (generatedTitles.length === 0) {
        throw new Error('タイトル候補を生成できませんでした。別のテーマを試してください。');
      }
      
      setTitles(generatedTitles);
    } catch (err) {
      console.error('タイトル再生成エラー:', err);
      setError('タイトル候補の再生成中にエラーが発生しました。後でもう一度お試しください。');
      
      // エラー時は既存のタイトルをシャッフル
      setTitles([...titles].sort(() => Math.random() - 0.5));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOutlineChange = (newOutline: OutlineItem[]) => {
    setOutline(newOutline);
  };

  const handleOutlineApprove = async () => {
    setCurrentStep('content');
    setIsLoading(true);
    setError(null);
    
    try {
      // APIを使用して本文を生成
      if (!selectedTitle) {
        throw new Error('タイトルが選択されていません。');
      }
      
      const generatedContent = await generateContent(theme, selectedTitle, outline);
      
      if (!generatedContent) {
        throw new Error('本文を生成できませんでした。');
      }
      
      setContent(generatedContent);
    } catch (err) {
      console.error('本文生成エラー:', err);
      setError('本文の生成中にエラーが発生しました。後でもう一度お試しください。');
      
      // エラー時はダミーコンテンツを生成
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateOutline = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // APIを使用してアウトライン候補を再生成
      if (!selectedTitle) {
        throw new Error('タイトルが選択されていません。');
      }
      
      const generatedOutline = await generateOutline(theme, selectedTitle);
      
      if (generatedOutline.length === 0) {
        throw new Error('アウトラインを生成できませんでした。別のタイトルを試してください。');
      }
      
      setOutline(generatedOutline);
    } catch (err) {
      console.error('アウトライン再生成エラー:', err);
      setError('アウトラインの再生成中にエラーが発生しました。後でもう一度お試しください。');
      
      // エラー時は既存のアウトラインをシャッフル
      setOutline([...outline].sort(() => Math.random() - 0.5));
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleRegenerateContent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // APIを使用して本文を再生成
      if (!selectedTitle) {
        throw new Error('タイトルが選択されていません。');
      }
      
      const generatedContent = await generateContent(theme, selectedTitle, outline);
      
      if (!generatedContent) {
        throw new Error('本文を生成できませんでした。');
      }
      
      setContent(generatedContent);
    } catch (err) {
      console.error('本文再生成エラー:', err);
      setError('本文の再生成中にエラーが発生しました。後でもう一度お試しください。');
      
      // エラー時はダミーコンテンツを生成
      handleOutlineApprove();
    } finally {
      setIsLoading(false);
    }
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
          {error && (
            <div className="w-full max-w-2xl mx-auto mb-4 p-4 bg-red-50 border border-red-300 rounded-md text-red-700">
              {error}
            </div>
          )}
          
          {currentStep === 'theme' && (
            <ThemeInput onSubmit={handleThemeSubmit} isLoading={isLoading} />
          )}
          
          {currentStep === 'titles' && (
            <TitleSelection
              titles={titles}
              selectedTitle={selectedTitle}
              onSelect={handleTitleSelect}
              onRegenerate={handleRegenerateTitles}
              onProceed={handleProceedToOutline}
              isLoading={isLoading}
            />
          )}

          {currentStep === 'outline' && (
            <OutlineEditor
              outline={outline}
              onOutlineChange={handleOutlineChange}
              onApprove={handleOutlineApprove}
              onRegenerate={handleRegenerateOutline}
              isLoading={isLoading}
            />
          )}

          {currentStep === 'content' && (
            <ContentEditor
              content={content}
              onContentChange={handleContentChange}
              onRegenerate={handleRegenerateContent}
              onSave={handleSaveContent}
              isLoading={isLoading}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;