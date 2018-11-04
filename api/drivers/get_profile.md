## get_profile

### 説明
ドライバーがプロフィールを取得する時

### Path
```
GET /drivers/:user_id
```

### Request Body Example
特になし

### Response Body Example
```
{
  "driver":{
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
```
