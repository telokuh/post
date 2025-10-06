# Bot Downloader Serbaguna: Arsitektur Unduhan Hibrida 🤖💨

Bot Python canggih yang dirancang untuk mengatasi kompleksitas unduhan modern dari berbagai layanan hosting dan platform media. Bot ini secara cerdas menggabungkan kemampuan otomatisasi browser **Selenium** untuk menavigasi halaman web dinamis, dengan kekuatan unduhan berkecepatan tinggi dari utilitas CLI terkemuka seperti **Aria2c**, **yt-dlp**, dan **MegaTools**.

Bot ini secara cerdas memilih metode unduhan terbaik dan teraman untuk setiap jenis URL, sambil memberikan notifikasi progres yang konsisten melalui **Telegram**.

---

## ✨ Fitur Unggulan

### 1. Dukungan Multi-Platform yang Luas

Bot ini memiliki arsitektur hibrida yang memungkinkannya mengunduh file dari tautan langsung sederhana hingga laman web yang kompleks dan tautan media:

| Layanan | Metode Akses | Utilitas Unduhan | Keunggulan Fungsional |
| :--- | :--- | :--- | :--- |
| **GoFile / Mediafire** | Navigasi Otomatis (Selenium) | Unduhan Browser | Mengatasi tombol yang diaktifkan oleh JavaScript dan pop-up iklan. |
| **SourceForge** | Navigasi Mirror (Selenium) | `aria2c` (dengan Multi-Mirror) | Mengoptimalkan kecepatan dan keandalan dengan memilih cermin (mirror) terbaik yang tersedia dan menggunakan koneksi multipel. |
| **Pixeldrain** | API Query (`requests.head`) | `aria2c` | Cepat dan efisien karena mendapatkan metadata file (nama dan ukuran) langsung dari API sebelum memulai unduhan. |
| **YouTube, Media Lain** | Khusus Media | `yt-dlp` + `aria2c` backend | Mengunduh video/audio kualitas terbaik dari ribuan situs yang didukung oleh `yt-dlp`. |
| **MEGA.nz** | Khusus Terenkripsi | `megatools` | Mengatasi tautan MEGA yang dilindungi kata sandi dan terenkripsi dengan aman. |

### 2. Monitoring & Feedback Real-Time melalui Telegram

Bot ini memberikan pengalaman unduhan yang transparan melalui integrasi mendalam dengan Telegram:

* **Notifikasi Progres:** Memberikan pembaruan status, termasuk nama file, ukuran, dan notifikasi keberhasilan/kegagalan, langsung ke chat pribadi kamu.
* **Pembaruan Cerdas:** Progres unduhan yang berjalan diperbarui secara berkala, memastikan kamu selalu tahu status file kamu tanpa harus memeriksa server.
* **ID Owner:** Notifikasi ini dipersonalisasi menggunakan `BOT_TOKEN` dan `OWNER_ID` dari *environment variables* untuk keamanan.

---

## 🏗️ Mekanisme Unduhan Hibrida

### 1. Otomatisasi dengan Selenium

Untuk situs seperti GoFile dan Mediafire, bot menggunakan Selenium. Browser Chrome dijalankan dalam mode **headless** (`--headless`) di latar belakang, memuat halaman, menunggu tombol unduhan dimuat secara dinamis, lalu mensimulasikan klik. Setelah unduhan dipicu, file diunduh ke direktori sementara dan dimonitor hingga selesai sebelum **dipindahkan secara aman** ke direktori kerja utama.

### 2. Kecepatan Maksimum dengan Aria2c

Fungsi `download_file_with_aria2c` adalah inti kecepatan bot, terutama untuk tautan langsung atau SourceForge:

* **Koneksi Multiplexing:** Menggunakan argumen `-x 16 -s 16` untuk mengaktifkan **16 koneksi** (utas) per file.
* **Penghentian Cerdas:** Bot secara cerdas menggunakan `requests.head()` untuk mendapatkan **ukuran total file** yang diharapkan, dan menghentikan `aria2c` segera setelah file mencapai ukuran penuh, mengoptimalkan waktu unduhan.

### 3. Spesialis Media: yt-dlp

Ketika URL mengarah ke platform media (seperti YouTube), fungsi `download_with_yt_dlp` mengambil alih. Ia mengandalkan kekuatan `yt-dlp` untuk mengurai tautan media kompleks dan memilih format kualitas terbaik, sambil secara eksplisit menunjuk `aria2c` sebagai *backend* unduhan eksternal untuk memastikan kecepatan optimal.

---

## 💬 Hubungi Bot

Bot ini dijalankan menggunakan backend yang dijelaskan di atas. Kamu dapat berinteraksi langsung dengan bot melalui Telegram untuk memulai unduhan file kamu.

**Cari bot kami di Telegram:**
👉 **`@telokuh_bot`**

Silakan kirimkan tautan file yang ingin kamu unduh, dan biarkan bot yang mengerjakan sisanya!

---

## 📝 Catatan Pengembang

Kode ini dikembangkan menggunakan pustaka seperti `selenium`, `requests`, dan `subprocess` untuk mengintegrasikan alat CLI (`aria2c`, `yt-dlp`, `megatools`). Struktur kode diatur untuk keandalan dan pemulihan kesalahan, termasuk penanganan *timeout* dan penulisan ulang URL.
