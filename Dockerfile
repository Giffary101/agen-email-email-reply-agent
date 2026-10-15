# Gunakan Node.js versi 20 (LTS) dengan sistem operasi Alpine yang ringan
FROM node:20-alpine

# Tentukan direktori kerja utama di dalam kontainer
WORKDIR /app

# Salin definisi dependensi lebih dulu (memanfaatkan sistem cache Docker)
COPY package*.json ./

# Instal semua dependensi Node.js
RUN npm install

# Salin seluruh sisa kode sumber aplikasi Anda
COPY . .

# Beri tahu Docker bahwa aplikasi berjalan di port 3000
EXPOSE 3000

# Eksekusi agen menggunakan perintah yang sama seperti di lokal
CMD ["npm", "run", "dev"]