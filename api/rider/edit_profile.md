## edit_profile

### 説明
ライダーがプロフィールを編集する時

### Path
```
PATCH /api/riders/:user_id
(PUT /api/riders/:user_id)
```

### Request Body Example
```
{
  "first_name": "泰蔵",
  "last_name": "孫",
  "major": "経済学類",
  "grade": "学部2年",  // "grade": "b2" の方が良い？
  "email": "taizoson@stu.kanazawa-u.ac.jp",
  "phone": 08011119999,
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
