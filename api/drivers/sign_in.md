## sign_in

### 説明
ドライバーがサインインする時

### Path
```
POST /api/drivers/signin
```

### Request Body Example
```
{
  "email": "akiotoyoda@stu.kanazawa-u.ac.jp",
}
```

### Response Body Example
```
// サインアップ成功した時
code : 200
{
  driver: {
    "id": 1,
    "first_name": "章男",
    "last_name": "豊田",
    "major": "機械科学専攻",
    "grade": "修士1年",  // "grade": "m1" の方が良い？
    "email": "akiotoyoda@stu.kanazawa-u.ac.jp",
    "phone": 09012345678,
    "car_color": "白",
    "car_number": 1234
   }
}

// サインアップ失敗した時
code : 400, 500
```
