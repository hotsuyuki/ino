## reserve_offer

### 説明
ライダーが選択した相乗りオファーを予約する時

### Path
```
POST /api/reservations
```

### Request Body Example
```
{
  "offer_id": 0001,
  "rider_id": 002
}
```

### Response Body Example
```
// オファー予約成功した時
{
    "reservation_id": 00001
}

// オファー予約失敗した時
{
    "reservation_id": "null"
}
```
