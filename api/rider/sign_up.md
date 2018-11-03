## sign_up

### 説明
ライダーがサインアップする時

### Path
```
POST /api/riders
```

### Request Body Example
```
{
  "first_name": "正義",
  "last_name": "孫",
  "major": "国際学類",
  "grade": "学部3年",  // "grade": "b3" の方が良い？
  "email": "masayoshison@stu.kanazawa-u.ac.jp",
  "phone": 08012345678
}
```

### Response Body Example
```
// サインアップ成功した時
{
    "user_id": 002
}

// サインアップ失敗した時
{
    "user_id": "null"
}
```
