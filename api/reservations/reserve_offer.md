## reserve_offer

### 説明
ライダーが選択した相乗りオファーを予約する時

### Path
```
POST /reservations
```

### Request Body Example
```
{
  "id": 0, // 便宜上，仮の "id": 0 をつけて送る
  "offer_id": 1,
  "departure_time": "2018-10-04 10:00:00", // offer_idのオファーのdeparture_time
  "rider_id": 2
}
```

### Response Body Example
```
// オファー予約成功した時
{
  "id": 1,
}

// オファー予約失敗した時
400, 500
```
