## get_own_reservations

### 説明
ライダーが現在予約している自分の相乗りオファーの **リスト** を取得する時

### Path
```
GET /api/reservations?rider_id=:user_id
```

### Request Body Example
特になし

### Response Body Example
```
[
  {
    "reservation_id": 00001,
    "offer": {
      "offer_id": 0001,
      "driver": {
        "driver_id": 001,
        "first_name": "章男",
        "last_name": "豊田",
        "major": "機械科学専攻",
        "grade": "修士1年",  // "grade": "m1" の方が良い？
        "phone": 09012345678,
        "car_color": "白",
        "car_number": 1234
      },
      "start": "Vドラッグ", // "start": 001 のようなIDの方が良い？
      "goal": "自然研3号館", // "goal": 002 のようなIDの方が良い？
      "departure_time": "2018/10/4,Thu,10:00",
      "rider_occupancy": 1, // 既に埋まってる席数("reservations"項目の配列要素数)
      "rider_capacity": 2 // 全体の席数
    },
    "rider_id": 002
  },

  .
  .
  .
]
```
