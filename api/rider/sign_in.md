## sign_in

### 説明
ライダーがサインインする時

### Path
```
POST /riders/signin
```

### Request Body Example
```
{
  "email": "masayoshison@stu.kanazawa-u.ac.jp"
}
```

### Response Body Example
```
// サインアップ成功した時
code: 200
{
  rider: {
    "id": 2,
    "first_name": "正義",
    "last_name": "孫",
    "major": "国際学類",
    "grade": "学部3年",
    "email": "masayoshison@stu.kanazawa-u.ac.jp",
    "phone": 08012345678
   }
}

// サインアップ失敗した時
code: 400, 500
```
