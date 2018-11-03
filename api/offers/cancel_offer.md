## cancel_offer

### 説明
ドライバーが相乗りオファーをキャンセルする時

### Path
```
DELETE /api/offers/:offer_id
```

### Request Body Example
特になし

### Response Body Example
```
// オファーキャンセル成功した時
{
    "status": "true"
}

// オファーキャンセル失敗した時
{
    "status": "false"
}
```
