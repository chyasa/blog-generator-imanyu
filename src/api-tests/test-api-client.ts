// CommonJS形式で必要なモジュールをインポート
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

// __dirnameの代替
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 環境変数の読み込み
dotenv.config();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/beta/chat/completions';

// APIキーが設定されているか確認
if (!DEEPSEEK_API_KEY) {
  console.error('エラー: DEEPSEEK_API_KEYが設定されていません。.envファイルを確認してください。');
  process.exit(1);
}

// APIクライアントの代わりに直接実装
// テーマから見出し候補を生成する関数
async function generateHeadings(theme: string): Promise<string[]> {
  try {
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'あなたはブログの見出し構成を提案するアシスタントです。与えられたテーマに基づいて、ブログ記事に適した見出し（H1、H2、H3）の構成を提案してください。'
          },
          {
            role: 'user',
            content: `テーマ「${theme}」に関するブログ記事の見出し構成を提案してください。H1を1つ、H2を3〜5個、必要に応じてH3も提案してください。各見出しは簡潔で具体的なものにし、読者の興味を引くような内容にしてください。見出しのみをリスト形式で返してください。`
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

    // APIレスポンスから見出しを抽出
    const content = response.data.choices[0].message.content;
    
    // 改行で分割して配列に変換
    return content.split('\n').filter((line: string) => line.trim() !== '');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API呼び出しエラー:', error.response?.data || error.message);
    } else {
      console.error('エラーが発生しました:', error);
    }
    throw error;
  }
}

// ブログ本文を生成する関数
async function generateContent(headings: string[], theme: string): Promise<string> {
  try {
    const headingsText = headings.join('\n');
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'あなたはブログ記事のコンテンツを作成するアシスタントです。与えられた見出し構成に沿って、テーマに関連した情報豊かで読みやすいブログ記事を作成してください。'
          },
          {
            role: 'user',
            content: `テーマ「${theme}」に関するブログ記事を作成してください。以下の見出し構造に沿って、各セクションの内容を書いてください：\n\n${headingsText}\n\nマークダウン形式で返してください。見出しレベルを維持し、各セクションは300〜500文字程度で作成してください。専門的で信頼性のある内容にしてください。`
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

    return response.data.choices[0].message.content;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API呼び出しエラー:', error.response?.data || error.message);
    } else {
      console.error('エラーが発生しました:', error);
    }
    throw error;
  }
}

// 結果をファイルに保存する関数
function saveToFile(filename: string, content: string): void {
  const resultsDir = path.join(__dirname, 'results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(resultsDir, filename), content, 'utf8');
  console.log(`ファイルに保存しました: ${path.join(resultsDir, filename)}`);
}

// メイン処理
async function main() {
  // コマンドライン引数からテーマを取得
  const theme = process.argv[2] || '効率的な時間管理法';
  
  console.log(`テーマ「${theme}」の見出し候補を生成します...\n`);
  
  try {
    // 見出し生成
    const headings = await generateHeadings(theme);
    
    console.log('【生成された見出し候補】');
    headings.forEach((heading: string) => console.log(heading));
    
    // 結果をファイルに保存
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    saveToFile(`headings-${timestamp}.txt`, headings.join('\n'));
    
    // ユーザーに確認
    console.log('\n見出しが生成されました。ブログ本文を生成しますか？(y/n)');
    
    // 通常はユーザー入力を待ちますが、このテストでは自動的に続行
    console.log('テストのため自動的に続行します（y）\n');
    
    // ブログ本文生成
    console.log('ブログ本文を生成しています...');
    const content = await generateContent(headings, theme);
    
    console.log('\n【生成されたブログ本文（抜粋）】');
    console.log(content.substring(0, 300) + '...');
    
    // 結果をファイルに保存
    saveToFile(`blog-${timestamp}.md`, content);
    
    console.log('\n処理が完了しました。');
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

// プログラム実行
main(); 