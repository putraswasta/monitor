# Tianpower BMS GitHub Pages Dashboard

Dashboard responsif untuk PACK-01, PACK-02, dst dari MQTT HiveMQ.

## Konfigurasi
Edit `app.js` dan isi `username` serta `password` dengan credential HiveMQ **Subscribe Only**.

ESP8266 sebaiknya memakai credential **Publish Only** yang berbeda.

MQTT WebSocket: `wss://HOST:8884/mqtt`

Topic yang dibaca:
- `bms/+/status`
- `bms/+/data`
- `bms/+/cells`
- `bms/+/temperature`

## GitHub Pages
Upload tiga file utama (`index.html`, `style.css`, `app.js`) ke repository public, lalu Settings → Pages → Deploy from branch → `main` / root.

Catatan: credential yang dimasukkan ke JavaScript dapat terlihat oleh pengunjung. Gunakan akun Subscribe Only dengan permission/topic terbatas; jangan gunakan akun admin.
