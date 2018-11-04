## create_offer

### 説明
ドライバーが相乗りオファーを新規作成する時

### Path
```
POST /offers
```

### Request Body Example
```
{
  "id": 0,
  "driver_id": 1,
  "start": "Vドラッグ",
  "goal": "自然研3号館",
  "departure_time": "2018-10-04 10:00:00",
  "rider_capacity": 2 // 全体の席数
}
```

### Response Body Example
```
// オファー新規作成成功した時
{
    "id": 1
}

// オファー新規作成失敗した時
code: 400, 500
```
