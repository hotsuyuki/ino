## get_offer_detail

### 説明
ドライバー/ライダーが選択した相乗りオファーの **詳細** を取得する時

### Path
```
GET /offers/:offer_id
```

### Request Body Example
特になし

### Response Body Example
```
{
  "offer": 
    {
      "id": 1,
      "driver_id": 3,
      "start": "Vドラッグ",
      "goal": "自然研3号館", 
      "departure_time": "2018-10-04 10:00:00",
      "rider_capacity": 2
    },
    "reserved_riders": [1, 4] //riderのidの配列
}
```
