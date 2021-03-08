# API Documentaion

# 投稿作成

|　URL　| HTTPメソッド | 受け取るデータ形式 | 返すデータ形式 | 返すエラー | 備考 |
| ---- | ---- | ---- | ---- | ---- | ---- |
|  /api/post  |  POST  | JSON | なし | なし | なし |

## 受け取るデータ

```typescript
{
  user_id: number;
  test: string;
}
```
# 投稿取得

|　URL　| HTTPメソッド | 受け取るデータ形式 | 返すデータ形式 | 返すエラー | 備考 |
| ---- | ---- | ---- | ---- | ---- | ---- |
|  /api/post  |  GET  | なし | JSONの配列 | なし | なし |

```typescript
[
  {
      user_id: number,
      post_id: number,
      text_body: string,
      timestamp: string,
  }
]
```
