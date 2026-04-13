# Implementasi Fitur Login User

## Deskripsi Tugas
Tugas ini bertujuan untuk mengimplementasikan fitur login user. Setelah login berhasil, sistem akan membuat session baru dan mengembalikan token (UUID) yang dapat digunakan untuk autentikasi request selanjutnya. Pastikan mengikuti semua tahapan di bawah ini secara berurutan.

---

## 1. Spesifikasi Database
Buat tabel `sessions` dengan struktur kolom sebagai berikut:
- `id`: integer, auto increment, primary key
- `token`: varchar 255, not null (berisi UUID yang di-generate saat login)
- `user_id`: integer, foreign key ke tabel `users`
- `created_at`: timestamp, default `current_timestamp`

---

## 2. Spesifikasi API Login

Buatkan API untuk proses login user.

- **Endpoint**: `POST /api/users/login`
- **Request Body**:
  ```json
  {
      "email": "andi@localhost",
      "password": "rahasia"
  }
  ```

- **Response Body (Success)**:
  ```json
  {
      "data": "token"
  }
  ```
  > Nilai `"token"` diisi dengan UUID yang di-generate (contoh: `"550e8400-e29b-41d4-a716-446655440000"`)

- **Response Body (Error - Email atau Password Salah)**:
  ```json
  {
      "error": "email atau password salah"
  }
  ```

---

## 3. Struktur Folder dan File

Gunakan struktur folder dan penamaan file berikut yang sudah ada di dalam directory `src/`:

- `src/routes/`: Berisi file terkait routing Elysia.js. Tambahkan logic login ke file yang sudah ada: `user-route.ts`
- `src/service/`: Berisi logika bisnis aplikasi. Tambahkan logic login ke file yang sudah ada: `user-service.ts`

---

## 4. Tahapan Implementasi

Lakukan langkah-langkah berikut secara berurutan:

### Langkah 1: Update Skema Database (`src/db/schema.ts`)
1. Buka file `src/db/schema.ts`.
2. Tambahkan definisi tabel `sessions` sesuai **Spesifikasi Database** di atas.
3. Untuk relasi `user_id`, gunakan referensi ke tabel `users` menggunakan `references(() => users.id)` (sintaks Drizzle ORM).
4. Jalankan perintah berikut untuk sinkronisasi database:
   ```bash
   bun x drizzle-kit push
   ```

### Langkah 2: Update Service Layer (`src/service/user-service.ts`)
1. Buka file `src/service/user-service.ts`.
2. Tambahkan fungsi baru `loginUser(payload)` di file tersebut.
3. Di dalam fungsi tersebut, lakukan langkah-langkah berikut:
   - Cari user berdasarkan `email` dari database.
   - Jika user **tidak ditemukan**, lempar error: `throw new Error("email atau password salah")`.
   - Bandingkan `password` dari payload dengan hash yang tersimpan di database menggunakan `bcrypt.compare()`.
   - Jika password **tidak cocok**, lempar error: `throw new Error("email atau password salah")`.
   - Jika cocok, generate UUID sebagai token (gunakan `crypto.randomUUID()` yang sudah tersedia di Bun/Node secara native).
   - Simpan `token` dan `user_id` ke tabel `sessions`.
   - Kembalikan token tersebut sebagai return value.

### Langkah 3: Update Route Layer (`src/routes/user-route.ts`)
1. Buka file `src/routes/user-route.ts`.
2. Tambahkan route baru untuk endpoint `POST /api/users/login`.
3. Tangkap request body (`body.email`, `body.password`).
4. Jadikan panggilan ke fungsi `loginUser` berada di dalam blok `try/catch`.
5. Kembalikan response JSON `{"data": "<token>"}` jika sukses.
6. Di dalam `catch`, kembalikan JSON `{"error": "email atau password salah"}` jika gagal.

### Langkah 4: Verifikasi dan Pengujian
1. Jalankan aplikasi:
   ```bash
   bun run dev
   ```
2. Uji endpoint login menggunakan cURL atau Postman.

   **Skenario Sukses** (kredensial benar):
   ```bash
   curl -X POST http://localhost:3000/api/users/login \
     -H "Content-Type: application/json" \
     -d '{"email": "andi@localhost", "password": "rahasia"}'
   ```
   Ekspektasi: `{"data": "550e8400-e29b-41d4-a716-446655440000"}` *(UUID akan berbeda setiap kali)*

   **Skenario Gagal** (password salah):
   ```bash
   curl -X POST http://localhost:3000/api/users/login \
     -H "Content-Type: application/json" \
     -d '{"email": "andi@localhost", "password": "salah"}'
   ```
   Ekspektasi: `{"error": "email atau password salah"}`
