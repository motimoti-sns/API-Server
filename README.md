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

# 投稿更新
|　URL　| HTTPメソッド | 受け取るデータ形式 | 返すデータ形式 | 返すエラー | 備考 |
| ---- | ---- | ---- | ---- | ---- | ---- |
|  /api/post  |  PUT  | JSON | なし | なし | なし |


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
|  /api/post  | 　DELETE  | JSON | なし | なし | なし |

```typescript
{
    post_id: number,
}
```


# ユーザー登録
|　URL　| HTTPメソッド | 受け取るデータ形式 | 返すデータ形式 | 返すエラー | 備考 |
| ---- | ---- | ---- | ---- | ---- | ---- |
|  /api/register  | 　POST  | JSON | なし | なし | なし |

```typescript
{
    
    email: string,
    name: string,
    password": string
}
```
