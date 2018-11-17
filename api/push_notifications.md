## プッシュ通知

### 【ドライバー　→　うちらのサーバー】

アプリ起動時にまずドライバーの `id` と `token` を載せたJSONをうちらのサーバーにPOST
```
url: 'https://inori.work/drivers/push-token',

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
```
url: 'https://inori.work/riders/push-token',

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
```
{
  // An Expo push token specifying the recipient of this message.
  to: 'ExponentPushToken[xxxdriverxxx]',

  // A JSON object delivered to your app.
  data?: {
    type: 'reserved_offer',
    offer_id: 10,
    message_body: 'あなたの相乗りオファーが予約されました。' // `body?` と一緒の値
  },

  // The title to display in the notification.
  title?: '',

  // The message to display in the notification.
  body?: 'あなたの相乗りオファーが予約されました。',

  // A sound to play when the recipient receives this notification. (iOS only)
  sound?: 'default',

  // Number to display in the badge on the app icon. (iOS only)
  badge?: 1,

  // ID of the Notification Channel through which to display this notification on Android devices.
  // If left null, a "Default" channel will be used. (Android only)
  channelId?: null
}
```


### 【ライダー　→　うちらのサーバー　→　Expoサーバー　→　キャンセルされたドライバー】

ライダーが予約をキャンセルしたら([cancel_reservation.md](https://github.com/Hotsuyuki/ino/blob/master/api/reservations/cancel_reservation.md))、うちらのサーバーがExpoのサーバーにこんな感じのJSONをPOST
```
{
  // An Expo push token specifying the recipient of this message.
  to: 'ExponentPushToken[xxxdriverxxx]',

  // A JSON object delivered to your app.
  data?: {
    type: 'canceled_reservation',
    offer_id: 10,
    message_body: 'あなたの相乗りオファーへの予約がキャンセルされました。' // `body?` と一緒の値
  },

  // The title to display in the notification.
  title?: '',

  // The message to display in the notification.
  body?: 'あなたの相乗りオファーへの予約がキャンセルされました。',

  // A sound to play when the recipient receives this notification. (iOS only)
  sound?: 'default',

  // Number to display in the badge on the app icon. (iOS only)
  badge?: 1,

  // ID of the Notification Channel through which to display this notification on Android devices.
  // If left null, a "Default" channel will be used. (Android only)
  channelId?: null
}
```


### 【ドライバー　→　うちらのサーバー　→　Expoサーバー　→　キャンセルされたライダー】

ドライバーが予約済みライダーのいるオファーをキャンセルしてしまったら、([cancel_offer.md](https://github.com/Hotsuyuki/ino/blob/master/api/offers/cancel_offer.md))うちらのサーバーがExpoのサーバーにこんな感じのJSONをPOST
```
{
  // An Expo push token specifying the recipient of this message.
  to: 'ExponentPushToken[xxxdriverxxx]',

  // A JSON object delivered to your app.
  data?: {
    type: 'canceled_offer',
    offer_id: 10,
    message_body: '予約済みのオファーがキャンセルされました。' // `body?` と一緒の値
  },

  // The title to display in the notification.
  title?: '',

  // The message to display in the notification.
  body?: '予約済みのオファーがキャンセルされました。',

  // A sound to play when the recipient receives this notification. (iOS only)
  sound?: 'default',

  // Number to display in the badge on the app icon. (iOS only)
  badge?: 1,

  // ID of the Notification Channel through which to display this notification on Android devices.
  // If left null, a "Default" channel will be used. (Android only)
  channelId?: null
}
```
