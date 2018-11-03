## edit_profile

### 説明
ドライバーがプロフィールを編集する時

### Path
```
PATCH /api/drivers/:user_id
(PUT /api/drivers/:user_id)
```

### Request Body Example
```
{
  "first_name": "章子",
  "last_name": "松田",
  "major": "電子情報専攻",
  "grade": "修士2年",  // "grade": "m2" の方が良い？
  "email": "akikomatsuda@stu.kanazawa-u.ac.jp",
  "phone": 09011119999,
  "car_color": "赤",
  "car_number": 9999
}
```

### Response Body Example
```
// プロフィール編集成功した時
{
    "status": "true"
}

// プロフィール編集失敗した時
{
    "status": "false"
}
```
