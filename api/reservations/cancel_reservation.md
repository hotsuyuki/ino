## cancel_reservation

### 説明
ライダーが相乗り予約をキャンセルする時

### Path
```
DELETE /api/reservations/:reservation_id
```

### Request Body Example
特になし

### Response Body Example
```
// 予約キャンセル成功した時
{
    "status": "true"
}

// 予約キャンセル失敗した時
{
    "status": "false"
}
```
