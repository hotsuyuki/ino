## get_own_offers

### 説明
ドライバーが現在出している自分の相乗りオファーの **リスト** を取得する時

### Path
```
GET /api/offers?driver_id=:user_id
```

### Request Body Example
特になし

### Response Body Example
```
[
  {
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

  {
    "offer_id": 0002,
    "driver": {
      "driver_id": 001,
      "first_name": "章男",
      "last_name": "豊田",
      "major": "機械科学専攻",
      "grade": "修士1年",  // "grade": "m1" の方が良い？
      "email": "akiotoyoda@stu.kanazawa-u.ac.jp",
      "phone": 09012345678,
      "car_color": "白",
      "car_number": 1234
    },
    "start": "自然研3号館", // "start": 002 のようなIDの方が良い？
    "goal": "Vドラッグ", // "goal": 001 のようなIDの方が良い？
    "departure_time": "2018/10/4,Thu,18:00",
    "rider_occupancy": 0, // 既に埋まってる席数("reservations"項目の配列要素数)
    "rider_capacity": 2 // 全体の席数
  },

  .
  .
  .
]
```
