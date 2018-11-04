## edit_profile

### 説明
ドライバーがプロフィールを編集する時

### Path
```
PUT /api/drivers/:user_id
```

### Request Body Example
```
{
  "id": 1,
  "first_name": "章子",
  "last_name": "松田",
  "major": "電子情報専攻",
  "grade": "修士2年", 
  "email": "akikomatsuda@stu.kanazawa-u.ac.jp",
  "phone": 09011119999,
  "car_color": "赤",
  "car_number": 9999
}
```

### Response Body Example
```
// プロフィール編集成功した時
code: 200
{
    "driver": {
      {
        "id": 0,
        "first_name": "章子",
        "last_name": "松田",
        "major": "電子情報専攻",
        "grade": "修士2年", 
        "email": "akikomatsuda@stu.kanazawa-u.ac.jp",
        "phone": 09011119999,
        "car_color": "赤",
        "car_number": 9999
      }
    }
}

// プロフィール編集失敗した時
code: 400, 500
```
