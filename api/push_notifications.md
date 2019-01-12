## プッシュ通知

### 【ドライバー　→　うちらのサーバー】

アプリ起動時にまずドライバーの `id` と `token` を載せたJSONをうちらのサーバーにPOST
```js
url: 'https://inori.work/tokens/push/drivers',

method: 'POST',

headers: {
  Accept: 'application/json',
  'Content-Type': 'application/json',
},

body: JSON.stringify({
  id: 1, // ドライバーのID
  token: 'ExponentPushToken[xxxdriverxxx]'
})
```


### 【ライダー　→　うちらのサーバー】

アプリ起動時にまずライダーの `id` と `token` を載せたJSONをうちらのサーバーにPOST
```js
url: 'https://inori.work/tokens/push/riders',

method: 'POST',

headers: {
  Accept: 'application/json',
  'Content-Type': 'application/json',
},

body: JSON.stringify({
  id: 1, // ライダーのID
  token: 'ExponentPushToken[yyyrideryyy]'
})
```


### 【ライダー　→　うちらのサーバー　→　Expoサーバー　→　予約されたドライバー】

ライダーがドライバーのオファーに予約したら([reserve_offer.md](https://github.com/Hotsuyuki/ino/blob/master/api/reservations/reserve_offer.md))、うちらのサーバーがExpoのサーバーにこんな感じのJSONをPOST
```js
{
  // An Expo push token specifying the recipient of this message.
  to: 'ExponentPushToken[xxxdriverxxx]',

  // A JSON object delivered to your app.
  data: {
    type: 'reserved_offer',
    offer_id: 10,
    message_title: 'あなたの相乗りオファーが予約されました。' // `title?` と一緒の値
  },

  // The title to display in the notification.
  title: 'あなたの相乗りオファーが予約されました。',

  // The message to display in the notification.
  body: '',

  // The delivery priority of the message.
  priority: 'high',

  // A sound to play when the recipient receives this notification. (iOS only)
  sound: 'default',

  // Number to display in the badge on the app icon. (iOS only)
  badge: 1,

  // ID of the Notification Channel through which to display this notification on Android devices.
  // If left null, a "Default" channel will be used. (Android only)
  channelId: null
}
```


### 【ライダー　→　うちらのサーバー　→　Expoサーバー　→　キャンセルされたドライバー】

ライダーが予約をキャンセルしたら([cancel_reservation.md](https://github.com/Hotsuyuki/ino/blob/master/api/reservations/cancel_reservation.md))、うちらのサーバーがExpoのサーバーにこんな感じのJSONをPOST
```js
{
  // An Expo push token specifying the recipient of this message.
  to: 'ExponentPushToken[xxxdriverxxx]',

  // A JSON object delivered to your app.
  data: {
    type: 'canceled_reservation',
    offer_id: 10,
    message_title: 'あなたの相乗りオファーへの予約がキャンセルされました。' // `title?` と一緒の値
  },

  // The title to display in the notification.
  title: 'あなたの相乗りオファーへの予約がキャンセルされました。',

  // The message to display in the notification.
  body: '',

  // The delivery priority of the message.
  priority: 'high',

  // A sound to play when the recipient receives this notification. (iOS only)
  sound: 'default',

  // Number to display in the badge on the app icon. (iOS only)
  badge: 1,

  // ID of the Notification Channel through which to display this notification on Android devices.
  // If left null, a "Default" channel will be used. (Android only)
  channelId: null
}
```


### 【ドライバー　→　うちらのサーバー　→　Expoサーバー　→　キャンセルされたライダー】

ドライバーが予約済みライダーのいるオファーをキャンセルしてしまったら、([cancel_offer.md](https://github.com/Hotsuyuki/ino/blob/master/api/offers/cancel_offer.md))うちらのサーバーがExpoのサーバーにこんな感じのJSONをPOST
```js
{
  // An Expo push token specifying the recipient of this message.
  to: 'ExponentPushToken[yyyrideryyy]',

  // A JSON object delivered to your app.
  data: {
    type: 'canceled_offer',
    offer_id: 10, // 使用しないが、便宜上
    message_title: '予約済みのオファーがキャンセルされました。' // `title?` と一緒の値
  },

  // The title to display in the notification.
  title: '予約済みのオファーがキャンセルされました。',

  // The message to display in the notification.
  body: '',
  
  // The delivery priority of the message.
  priority: 'high',

  // A sound to play when the recipient receives this notification. (iOS only)
  sound: 'default',

  // Number to display in the badge on the app icon. (iOS only)
  badge: 1,

  // ID of the Notification Channel through which to display this notification on Android devices.
  // If left null, a "Default" channel will be used. (Android only)
  channelId: null
}
```


### 【うちらのサーバー　→　Expoサーバー　→　スケジュール登録済みライダー】

定刻になったら（登校オファーは前日夜21:00、下校オファーは当日昼15:00）、うちらのサーバーがExpoのサーバーにこんな感じのJSONをPOST
```js
{
  // An Expo push token specifying the recipient of this message.
  to: 'ExponentPushToken[yyyrideryyy]',

  // A JSON object delivered to your app.
  data: {
    type: 'recommend_offer'
  },

  // The title to display in the notification.
  title: 'スケジュール内のオファーが○○件あります。',

  // The message to display in the notification.
  body: '',
  
  // The delivery priority of the message.
  priority: 'high',

  // A sound to play when the recipient receives this notification. (iOS only)
  sound: 'default',
  
  // Badge number is omitted on purpose (not to change the current badge number on the device)

  // ID of the Notification Channel through which to display this notification on Android devices.
  // If left null, a "Default" channel will be used. (Android only)
  channelId: null
}
```
