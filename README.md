# Bot Downloader Serbaguna: Arsitektur Unduhan Hibrida 🤖💨

Bot Python yang dirancang untuk mengatasi kompleksitas unduhan modern dari berbagai layanan hosting dan platform media. Bot ini menggabungkan kemampuan otomatisasi browser **Selenium** untuk menavigasi halaman web dinamis, dengan kekuatan unduhan berkecepatan tinggi dari utilitas CLI seperti **Aria2c**, **yt-dlp**, dan **MegaTools**.

Bot ini secara cerdas memilih metode unduhan terbaik dan teraman untuk setiap jenis URL, sambil memberikan notifikasi progres yang konsisten melalui Telegram.

---

## ✨ Fitur Utama

### 1. Metode Unduhan Adaptif (The Right Tool for The Job)

Bot ini memiliki arsitektur hibrida yang memungkinkannya mengunduh file dari tautan langsung hingga laman web yang kompleks.

| Layanan | Metode Akses | Utilitas Unduhan | Keunggulan |
| :--- | :--- | :--- | :--- |
| **GoFile / Mediafire** | Selenium (Navigasi & Klik) | Chrome/Selenium In-Browser | Mengatasi tombol yang dihasilkan oleh JavaScript. |
| **SourceForge** | Selenium (Navigasi Mirror) | `aria2c` (dengan Daftar Mirror) | Memaksimalkan kecepatan dan keandalan dengan memilih mirror terbaik. |
| **Pixeldrain** | API Query (`requests.head`) | `aria2c` | Cepat, efisien, dan mendapatkan metadata file sebelum unduhan. |
| **YouTube, Media Lain** | Khusus Media | `yt-dlp` + `aria2c` backend | Mengunduh video/audio kualitas terbaik dari ribuan situs. |
| **MEGA.nz** | Khusus Terenkripsi | `megatools` | Mengatasi tautan MEGA yang dilindungi dan terenkripsi. |

### 2. Monitoring & Feedback Real-Time

* **Notifikasi Telegram:** Menggunakan variabel lingkungan (`BOT_TOKEN` dan `OWNER_ID`) untuk mengirim pembaruan status, termasuk nama file, ukuran, dan notifikasi keberhasilan/kegagalan.
* **Progress Otomatis:** Meskipun pengurai progres CLI yang berbeda sulit, bot ini memberikan *feedback* progres yang cerdas (misalnya, progres 10% di `megatools`, atau pembaruan status file di `aria2c`).
* **Pemindahan File Aman:** File yang diunduh (terutama dari Selenium) secara aman dipindahkan dari direktori sementara ke direktori kerja utama (**Current Working Directory** - CWD).

---

## 🏗️ Arsitektur dan Mekanisme Teknis

Bot ini terdiri dari beberapa komponen inti yang bekerja bersama untuk mengotomatisasi proses unduhan.

### 1. Logic Handler URL (Router Inti)

Fungsi utama (`main_downloader_router` – jika ditambahkan) akan memeriksa pola URL (misalnya, `pixeldrain.com`, `mega.nz`, `youtube.com`) dan kemudian meneruskan kontrol ke fungsi unduhan yang sesuai, memastikan *tool* yang benar digunakan untuk *job* yang benar.

### 2. Selenium & Penanganan Browser

Untuk situs yang memerlukan interaksi pengguna (seperti **Mediafire** atau **GoFile**), bot menggunakan:

* **Mode Headless:** Chrome dijalankan tanpa antarmuka grafis (`--headless`) untuk efisiensi.
* **`webdriver-manager`:** Digunakan untuk mengelola dan menginstal ChromeDriver secara otomatis, memastikan kompatibilitas.
* **Preferensi Unduhan:** Konfigurasi khusus diatur untuk memaksa Chrome mengunduh file secara otomatis ke direktori sementara tanpa meminta konfirmasi (`"download.prompt_for_download": False`).

### 3. Integrasi Aria2c (High-Speed Downloader)

Fungsi `download_file_with_aria2c` adalah inti kecepatan bot:

* **Koneksi Maksimum:** Menggunakan argumen `-x 16 -s 16` untuk mengaktifkan **16 koneksi** (utas) per file, memaksimalkan *throughput*.
* **Penentuan Ukuran File:** Sebelum memulai unduhan, `get_total_file_size_safe` dijalankan. Aria2c kemudian dihentikan secara cerdas ketika ukuran file yang diunduh mencapai atau melampaui ukuran total yang diharapkan.
* **SourceForge Mirroring:** Bot mendapatkan daftar mirror SourceForge, lalu memberikan semua URL mirror tersebut ke `aria2c`. Aria2c akan secara otomatis mencoba mirror satu per satu, meningkatkan keandalan unduhan.

### 4. Spesialis Media (yt-dlp)

Untuk tautan media, fungsi `download_with_yt_dlp` memanfaatkan keunggulan `yt-dlp` untuk mengurai tautan media kompleks dan memilih format kualitas tertinggi, sambil secara eksplisit menunjuk `aria2c` sebagai *backend* unduhan eksternal untuk kecepatan optimal (`--external-downloader aria2c`).

---

## 🛠️ Persyaratan Instalasi

Bot ini memerlukan utilitas CLI dan paket Python berikut untuk berfungsi dengan baik.

### 1. Utilitas Baris Perintah (CLI)

Pastikan utilitas ini terinstal dan dapat diakses dari PATH sistem kamu:

| Utilitas | Deskripsi | Cara Instalasi (Umum) |
| :--- | :--- | :--- |
| **`aria2c`** | Mesin unduhan utama untuk koneksi multipel. | `sudo apt install aria2` atau `brew install aria2` |
| **`yt-dlp`** | Pengurai tautan dan pengunduh media. | `sudo pip install yt-dlp` |
| **`megatools`** | Pengunduh khusus untuk layanan MEGA.nz. | `sudo apt install megatools` atau `brew install megatools` |
| **Google Chrome** | Diperlukan untuk Selenium. | (Instalasi browser standar) |

### 2. Dependensi Python

Instal pustaka Python yang diperlukan:

```bash
pip install selenium requests webdriver-manager
