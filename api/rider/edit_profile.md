## edit_profile

### 説明
ライダーがプロフィールを編集する時

### Path
```
PUT /riders/:user_id
```

### Request Body Example
```
{
  "id": 1,
  "first_name": "泰蔵",
  "last_name": "孫",
  "major": "経済学類",
  "grade": "学部2年",
  "email": "taizoson@stu.kanazawa-u.ac.jp",
  "phone": 08011119999,
}
```

### Response Body Example
```
// プロフィール編集成功した時
{
    "rider": {    
      {
        "id": 1,
        "first_name": "泰蔵",
        "last_name": "孫",
        "major": "経済学類",
        "grade": "学部2年",
        "email": "taizoson@stu.kanazawa-u.ac.jp",
        "phone": 08011119999,
      }
    }
}

// プロフィール編集失敗した時
code: 400, 500
```
