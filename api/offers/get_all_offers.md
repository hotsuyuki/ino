## get_all_offers

### 説明
ライダーが現在出ている全ての相乗りオファーの **リスト** を取得する時

### Path
```
GET /offers
```

### Request Body Example
特になし

### Response Body Example
```
{ 
"offers":
  [
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
     },
     {
      "offer": 
       {
        "id": 2,
        "driver_id": 7,
        "start": "Vドラッグ",
        "goal": "自然研3号館", 
        "departure_time": "2018-10-04 10:00:00",
        "rider_capacity": 2
       },
      "reserved_riders": [3, 5] //riderのidの配列
     },
  ]
}
```
