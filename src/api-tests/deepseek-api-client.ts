import axios from 'axios';

export interface DeepseekAPIOptions {
  apiKey: string;
  apiUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class DeepseekAPIClient {
  private apiKey: string;
  private apiUrl: string;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(options: DeepseekAPIOptions) {
    this.apiKey = options.apiKey;
    this.apiUrl = options.apiUrl || 'https://api.deepseek.com/beta/chat/completions';
    this.model = options.model || 'deepseek-chat';
    this.temperature = options.temperature ?? 0.7;
    this.maxTokens = options.maxTokens ?? 1000;
  }

  /**
   * テーマから見出し候補を生成する
   * @param theme 記事のテーマ
   * @returns 見出しの配列
   */
  async generateHeadings(theme: string): Promise<string[]> {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
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
          temperature: this.temperature,
          max_tokens: this.maxTokens
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
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

  /**
   * 見出しと内容からブログ本文を生成する
   * @param headings 見出しの配列
   * @param theme ブログのテーマ
   * @returns 生成されたブログ本文
   */
  async generateContent(headings: string[], theme: string): Promise<string> {
    try {
      const headingsText = headings.join('\n');
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
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
          temperature: this.temperature,
          max_tokens: 4000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
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
} 