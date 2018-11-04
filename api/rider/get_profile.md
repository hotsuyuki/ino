## get_profile

### 説明
ライダーがプロフィールを取得する時

### Path
```
GET /riders/:user_id
```

### Request Body Example
特になし

### Response Body Example
```
{
  "rider":{
    "id": 1,
    "first_name": "正義",
    "last_name": "孫",
    "major": "国際学類",
    "grade": "学部3年",  // "grade": "b3" の方が良い？
    "email": "masayoshison@stu.kanazawa-u.ac.jp",
    "phone": 08012345678
  }
}
```
