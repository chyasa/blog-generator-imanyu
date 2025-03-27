// @ts-ignore
import axios from 'axios';
// @ts-ignore
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

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

// テーマから見出し候補を生成する関数
async function generateHeadingsFromTheme(theme: string): Promise<string[]> {
  try {
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat', // 使用するモデル名（APIドキュメントに基づいて適切なモデル名に変更してください）
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
    const headings = content.split('\n').filter((line: string) => line.trim() !== '');
    
    return headings;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API呼び出しエラー:', error.response?.data || error.message);
    } else {
      console.error('エラーが発生しました:', error);
    }
    return [];
  }
}

// 実行関数
async function main() {
  // コマンドライン引数からテーマを取得
  const theme = process.argv[2] || '効率的な時間管理法';

  console.log(`テーマ「${theme}」の見出し候補を生成します...\n`);

  const headings = await generateHeadingsFromTheme(theme);

  if (headings.length > 0) {
    console.log('【生成された見出し候補】');
    headings.forEach(heading => console.log(heading));
    
    // 結果をファイルに保存
    const resultsDir = path.join(__dirname, 'results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.join(resultsDir, `headings-${timestamp}.txt`);
    
    fs.writeFileSync(filename, headings.join('\n'), 'utf8');
    console.log(`\n結果を ${filename} に保存しました。`);
  } else {
    console.log('見出し候補の生成に失敗しました。');
  }
}

// プログラム実行
main().catch(error => {
  console.error('プログラム実行エラー:', error);
  process.exit(1);
}); 