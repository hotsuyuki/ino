## sign_up

### 説明
ドライバーがサインアップする時

### Path
```
POST /api/drivers
```

### Request Body Example
```
{
  "first_name": "章男",
  "last_name": "豊田",
  "major": "機械科学専攻",
  "grade": "修士1年",  // "grade": "m1" の方が良い？
  "email": "akiotoyoda@stu.kanazawa-u.ac.jp",
  "phone": 09012345678,
  "car_color": "白",
  "car_number": 1234
}
```

### Response Body Example
```
// サインアップ成功した時
{
    "user_id": 001
}

// サインアップ失敗した時
{
    "user_id": "null"
}
```
