## sign_up

### 説明
ドライバーがサインアップする時

### Path
```
POST /api/drivers/signup
```

### Request Body Example
```
{
  "id": 0, // 便宜上，仮の "id": 0 をつけて送る
  "first_name": "章男",
  "last_name": "豊田",
  "major": "機械科学専攻",
  "grade": "修士1年",
  "email": "akiotoyoda@stu.kanazawa-u.ac.jp",
  "phone": 09012345678,
  "car_color": "白",
  "car_number": 1234
}
```

### Response Body Example
```
// サインアップ成功した時
code : 200
{
    "id": 1
}

// サインアップ失敗した時
code : 400, 500
```
