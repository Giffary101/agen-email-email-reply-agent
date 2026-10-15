# 🤖 Email Reply Agent

Agen AI otonom yang bertugas memantau email masuk dan menyusun draf balasan secara otomatis menggunakan Google Gemini API dan Gmail API. 

Sistem ini menerapkan konsep **Human-in-the-Loop**. Agen tidak akan menekan tombol "Kirim", melainkan menyusun pesan di folder **Draft** Gmail Anda untuk peninjauan akhir.

## Prasyarat
1. Node.js (v18 atau lebih baru).
2. Akun Google Cloud Platform (GCP).
3. API Key Google Gemini (dari Google AI Studio).

## Instalasi
1. Ekstrak file zip ini ke direktori yang Anda inginkan.
2. Buka terminal di dalam folder tersebut dan jalankan perintah instalasi dependensi:
   ```bash
   npm install
   ```
3. Buka file `.env` di editor teks Anda dan masukkan kredensial yang dibutuhkan.

## Konfigurasi Google Cloud Platform & Gmail API
Agen ini membutuhkan akses resmi ke kotak masuk Anda melalui kredensial OAuth.
1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Buat proyek baru dan pastikan Anda mengaktifkan **Gmail API**.
3. Arahkan navigasi ke menu **APIs & Services > Credentials**, lalu buat **OAuth client ID** (Pilih aplikasi Web).
4. Gunakan URL *Redirect* `https://developers.google.com/oauthplayground` pada konfigurasi tersebut.
5. Salin `Client ID` dan `Client Secret` ke dalam file `.env`.
6. Buka OAuth Playground, masukkan kredensial Anda, pilih *scope* `https://mail.google.com/`, dan *authorize* untuk mendapatkan `Refresh Token`. Masukkan ke `.env`.

## Menjalankan Agen
Untuk memulai server pengembangan dengan auto-reload, gunakan perintah:
```bash
npm run dev
```
