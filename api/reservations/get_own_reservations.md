## get_own_reservations

### 説明
ライダーが現在予約している自分の相乗りオファーの **リスト** を取得する時

### Path
```
GET /reservations?rider_id=:rider_id
```

### Request Body Example
特になし

### Response Body Example
```
{
"reservations":
  [
    {
      "id":2,
       "offer_id":4,
       "rider_id":1
    },
    {
      "id":3,
       "offer_id":14,
       "rider_id":1
    }
  ]
}
```
