# Blog Generator Imanyu

ブログの企画から執筆・出力までをサポートするブログジェネレーターアプリケーション

## Deepseek APIテスト

このプロジェクトにはDeepseek APIを使って見出し候補を生成するテスト機能が含まれています。

### セットアップ

1. Deepseekのウェブサイト（https://platform.deepseek.com/）にアクセスしてアカウントを作成またはログイン
2. APIキーを発行する
3. プロジェクトルートの`.env`ファイルに以下のように設定する：
   ```
   DEEPSEEK_API_KEY=your_api_key_here
   ```
   `your_api_key_here`の部分を実際のAPIキーに置き換えてください。

### テスト実行方法

テーマを指定して見出し候補を生成：

```bash
npm run test:deepseek "あなたのテーマ"
```

APIクライアントを使用した見出し・本文の生成テスト：

```bash
npm run test:api-client "あなたのテーマ"
```

テーマを省略した場合は、デフォルトで「効率的な時間管理法」がテーマとして使用されます。

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/chyasa/blog-generator-imanyu)