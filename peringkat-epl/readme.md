# Animasi Akumulasi Poin Tim EPL

## Deskripsi 
<div style="text-align: right"> 
Membuat animasi diagram batang, yang menunjukkan akumulasi poin dari tim yang pernah bermain di divisi tertinggi liga inggris(sejak tahun 1992 bernama EPL), dari tahun 1888
sampai 2021. Animasi ini terinspirasi dari video youtube berjudul <a href="https://www.youtube.com/watch?v=Yeh1FzHHO80">Countries With The Highest COVID-19 Deaths Number</a>. Data mengenai perolehan poin yang diperoleh tim dari tahun ke tahun diperoleh dari website <a href="http://www.englishfootballstats.co.uk/leaguetables.htm">englishfootballstats</a>. Animasi
dibuat menggunakan paket p5.js di bahasa javascript. Hasil dari video animasi yang dijalankan di browser, "ditangkap" menggunakan <a href="https://github.com/spite/ccapture.js/">ccapture.js</a>
, untuk menghasilkan video. Font tulisan yang digunakan di animasi adalah comic sans yang dapat diperoleh pada link berikut 
<a href="https://www.dafont.com/comic-san-dy.font">comic sans</a>,<a href="https://www.wfonts.com/font/comic-sans-ms#google_vignette">comic sans</a>.
</div>


## File di repository
* index.html
* sketch.js
* df_recordSum.csv : file csv ini berisi data mengenai akumulasi point dari suatu tim di tahun tertentu 
* df_stand.csv : file csv ini berisi data mengenai peringkat keseluruhan, dari tim yang pernah berlaga di divisi tertinggi liga inggris, pada suatu tahun

## Cara menjalankan
1. Setelah mendownload repository, tambahkan beberapa file yang perlu sebagai berikut. Misalkan folder utama kita bernama main
   * Tambahkan folder bernama assets yang berisi Comic San DY-free.otf dan ComicSansMS3.ttf, yang dapat diperoleh dari 
   <a href="https://www.dafont.com/comic-san-dy.font">comic sans</a>,<a href="https://www.wfonts.com/font/comic-sans-ms#google_vignette">comic sans</a>., ke main
   * Simpan hasil ekstraksi <a href="https://github.com/spite/ccapture.js/">ccapture.js</a> yang telah di download di main
2. Buka index.html di code editor dan jalankan di server lokal. Setelah animasi di browser selesai, akan muncul opsi untuk mendownload video.

Maaf jika terdapat beberapa baris kode atau langkah yang tidak efektif.
Terimakasih.
