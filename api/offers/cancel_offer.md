## cancel_offer

### 説明
ドライバーが相乗りオファーをキャンセルする時

### Path
```
DELETE /offers/:offer_id
```

### Request Body Example
特になし

### Response Body Example
```
// オファーキャンセル成功した時
{
    "id": 1 // キャンセルしたオファーのid
}

// オファーキャンセル失敗した時
400, 500
```
