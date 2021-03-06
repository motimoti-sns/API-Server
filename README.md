# API Documentaion

# 投稿作成

|　URL　| HTTPメソッド | 受け取るデータ形式 | 返すデータ形式 | 返すエラー | 備考 |
| ---- | ---- | ---- | ---- | ---- | ---- |
|  /api/post  |  POST  | JSON | string | なし | HeaderにAuthorizationプロパティが必要 |

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
|  /api/posts/:offset/:limit  |  GET  | limit: 取得するデータの数、０で全て取得, offset: 最新から何番目のデータから取得するか | JSONの配列 | なし | HeaderにAuthorizationプロパティが必要 |

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

# 投稿更新
|　URL　| HTTPメソッド | 受け取るデータ形式 | 返すデータ形式 | 返すエラー | 備考 |
| ---- | ---- | ---- | ---- | ---- | ---- |
|  /api/post  |  PUT  | JSON | string | なし | HeaderにAuthorizationプロパティが必要 |


```typescript
{
    user_id: number,
    post_id: number,
    text: string,
}
```

# 投稿削除
|　URL　| HTTPメソッド | 受け取るデータ形式 | 返すデータ形式 | 返すエラー | 備考 |
| ---- | ---- | ---- | ---- | ---- | ---- |
|  /api/post  | 　DELETE  | JSON | string | なし | HeaderにAuthorizationプロパティが必要 |

```typescript
{
    post_id: number,
}
```

# 指定した投稿の過去の差分を取得する
|　URL　| HTTPメソッド | 受け取るデータ形式 | 返すデータ形式 | 返すエラー | 備考 |
| ---- | ---- | ---- | ---- | ---- | ---- |
|  /api/post/history/:postId |  GET  | なし | string array | なし | HeaderにAuthorizationプロパティが必要 |



# ユーザー登録
|　URL　| HTTPメソッド | 受け取るデータ形式 | 返すデータ形式 | 返すエラー | 備考 |
| ---- | ---- | ---- | ---- | ---- | ---- |
|  /api/register  | 　POST  | JSON | string | なし | なし |

```typescript
{
    
    email: string,
    name: string,
    password": string
}
```

# ログイン
|　URL　| HTTPメソッド | 受け取るデータ形式 | 返すデータ形式 | 返すエラー | 備考 |
| ---- | ---- | ---- | ---- | ---- | ---- |
|  /api/login  | 　POST  | JSON | string(jwtトークン) | なし | なし |

```typescript
{
    
    email: string,
    password": string
}
```

# ハッシュチェーンの検証
|　URL　| HTTPメソッド | 受け取るデータ形式 | 返すデータ形式 | 返すエラー | 備考 |
| ---- | ---- | ---- | ---- | ---- | ---- |
|  /api/validate/:userID  | 　GET  | なし | string | なし | なし |

