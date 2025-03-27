import axios from 'axios';
import { OutlineItem } from '../types';

// 環境変数からAPIキーを取得
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/beta/chat/completions';

// タイトル候補を生成する関数
export const generateTitles = async (theme: string): Promise<string[]> => {
  try {
    if (!DEEPSEEK_API_KEY) {
      console.error('APIキーが設定されていません。.envファイルにVITE_DEEPSEEK_API_KEYを設定してください。');
      return [];
    }

    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'あなたはブログのタイトル候補を提案するアシスタントです。与えられたテーマに基づいて、魅力的で人目を引くブログタイトルを提案してください。'
          },
          {
            role: 'user',
            content: `テーマ「${theme}」に関するブログ記事のタイトル候補を5つ提案してください。SEO効果があり、クリック率の高そうなタイトルにしてください。タイトルは箇条書きで、各タイトルは1行にまとめて出力してください。`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        }
      }
    );

    // APIレスポンスからタイトル候補を抽出
    const content = response.data.choices[0].message.content;
    
    // 各行をタイトルとして取得し、余分な文字（箇条書き記号など）を削除
    return content
      .split('\n')
      .filter((line: string) => line.trim() !== '')
      .map((line: string) => line.replace(/^[-*•\d.\s]+/, '').trim())
      .filter((title: string) => title !== '');
      
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API呼び出しエラー:', error.response?.data || error.message);
    } else {
      console.error('エラーが発生しました:', error);
    }
    // エラー時はダミーデータを返す
    return [
      `${theme}に関する記事タイトル候補1`,
      `${theme}に関する記事タイトル候補2`,
      `${theme}に関する記事タイトル候補3`,
      `${theme}を分かりやすく解説した初心者向けガイド`,
      `【2024年最新】${theme}の完全マニュアル`
    ];
  }
};

// アウトラインを生成する関数
export const generateOutline = async (theme: string, title: string): Promise<OutlineItem[]> => {
  try {
    if (!DEEPSEEK_API_KEY) {
      console.error('APIキーが設定されていません。.envファイルにVITE_DEEPSEEK_API_KEYを設定してください。');
      return [];
    }

    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'あなたはブログ記事のアウトライン構成を提案するアシスタントです。与えられたテーマとタイトルに基づいて、ブログ記事に適したアウトラインを提案してください。'
          },
          {
            role: 'user',
            content: `テーマ「${theme}」、タイトル「${title}」のブログ記事のアウトラインを作成してください。
            アウトラインは以下の条件を満たすように作成してください：
            - 最上位の見出し（レベル1）は4〜6個程度
            - 必要に応じて見出しの下に小見出し（レベル2）を含める
            - 各見出しは具体的で読者の興味を引く内容にする
            - アウトラインはJSON形式で出力してください
            
            出力するJSONは以下のような構造にしてください：
            [
              { "id": "1", "title": "見出しのテキスト", "level": 1 },
              { "id": "2", "title": "別の見出しのテキスト", "level": 1 },
              { "id": "3", "title": "小見出しのテキスト", "level": 2 },
              ...
            ]
            
            出力はJSON形式のみで、余分な説明やマークダウン記法は不要です。`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        }
      }
    );

    // APIレスポンスからJSONを抽出
    const content = response.data.choices[0].message.content;
    
    // JSONを抽出（APIがJSONだけでなく説明テキストも含めてくる場合がある）
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        const outlineItems = JSON.parse(jsonMatch[0]) as OutlineItem[];
        return outlineItems;
      } catch (parseError) {
        console.error('JSONのパースエラー:', parseError);
        throw new Error('アウトラインのパースに失敗しました');
      }
    } else {
      throw new Error('アウトラインの生成に失敗しました');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API呼び出しエラー:', error.response?.data || error.message);
    } else {
      console.error('エラーが発生しました:', error);
    }
    
    // エラー時はダミーデータを返す
    return [
      { id: '1', title: 'はじめに', level: 1 },
      { id: '2', title: `${title}の概要`, level: 1 },
      { id: '3', title: '主要なポイント', level: 2 },
      { id: '4', title: '基本的な知識', level: 1 },
      { id: '5', title: '実践的なアドバイス', level: 1 },
      { id: '6', title: '応用例', level: 2 },
      { id: '7', title: 'まとめ', level: 1 },
    ];
  }
};

// 本文を生成する関数
export const generateContent = async (theme: string, title: string, outline: OutlineItem[]): Promise<string> => {
  try {
    if (!DEEPSEEK_API_KEY) {
      console.error('APIキーが設定されていません。.envファイルにVITE_DEEPSEEK_API_KEYを設定してください。');
      return '';
    }

    // アウトラインを整形してプロンプトに含める
    const outlineText = outline.map(item => {
      const indent = item.level === 1 ? '' : '  ';
      return `${indent}${item.level === 1 ? '##' : '###'} ${item.title}`;
    }).join('\n');

    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'あなたはプロのブロガーです。与えられたテーマ、タイトル、アウトラインに基づいて、読みやすく情報価値の高いブログ記事を作成してください。'
          },
          {
            role: 'user',
            content: `テーマ「${theme}」、タイトル「${title}」のブログ記事を作成してください。
            
            以下のアウトラインに沿って、各セクションの内容を充実させてください：
            
            # ${title}
            
            ${outlineText}
            
            記事作成の条件：
            - マークダウン形式で記述してください
            - 各見出しに対して200〜300文字程度の内容を書いてください
            - 読者が実践できる具体的なアドバイスや例を含めてください
            - 専門用語がある場合は初心者にもわかるように説明を加えてください
            - 自然で読みやすい文体を心がけてください
            - 各セクションの最後に次のセクションへの繋がりを意識してください
            - 重要：コードブロック（\`\`\`）は使用せず、代わりにインデントや箇条書きを使ってください
            - コード例が必要な場合は、バッククォート1つで囲むインラインコード（\`例\`）を使用してください
            - コマンドやコード例は極力避け、文章での説明を優先してください
            `
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        }
      }
    );

    // APIレスポンスから本文を取得
    const content = response.data.choices[0].message.content;
    return content;
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API呼び出しエラー:', error.response?.data || error.message);
    } else {
      console.error('エラーが発生しました:', error);
    }
    
    // エラー時はダミーテキストを返す
    return `# ${title}\n\n## はじめに\n${theme}に関する記事です。このガイドでは、基礎から実践的な内容まで、ステップバイステップで解説していきます。\n\n${
      outline.map(item => {
        if (item.level === 1) {
          return `\n## ${item.title}\nこのセクションでは「${item.title}」について説明します。${theme}における${item.title}の重要性や基本的な概念について理解を深めていきましょう。\n`;
        } else {
          return `\n### ${item.title}\n${item.title}に関する詳細情報です。このポイントを押さえることで、${theme}への理解がさらに深まります。\n`;
        }
      }).join('')
    }\n\n## まとめ\n以上が${theme}についての基本的な解説でした。この記事を参考に、実践してみてください。`;
  }
}; 