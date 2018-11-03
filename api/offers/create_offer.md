## create_offer

### 説明
ドライバーが相乗りオファーを新規作成する時

### Path
```
POST /api/offers
```

### Request Body Example
```
{
  "driver_id": 001,
  "start": "Vドラッグ", // "start": 001 のようなIDの方が良い？
  "goal": "自然研3号館", // "goal": 002 のようなIDの方が良い？
  "departure_time": "2018/10/4,Thu,10:00",
  "rider_capacity": 2 // 全体の席数
}
```

### Response Body Example
```
// オファー新規作成成功した時
{
    "offer_id": 0001
}

// オファー新規作成失敗した時
{
    "offer_id": "null"
}
```
