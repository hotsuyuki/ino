## get_offer_detail

### 説明
ドライバー/ライダーが選択した相乗りオファーの **詳細** を取得する時

### Path
```
GET /api/offers/:offer_id
```

### Request Body Example
特になし

### Response Body Example
```
{
  "reservations": [
    {
      "rider_id": 002,
      "first_name": "正義",
      "last_name": "孫",
      "major": "国際学類",
      "grade": "学部3年",  // "grade": "b3" の方が良い？
      "phone": 08012345678,
    },

    .
    .
    .
  ]
}
```
