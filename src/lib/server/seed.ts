import bcrypt from 'bcryptjs';
import { pool, q, one } from './db';
import { buatKode } from './laporan';

const KATEGORI = [
  ['Jalan rusak', 'Lubang, retak, atau amblas di badan jalan', '#C8501E'],
  ['Lampu jalan', 'Penerangan jalan umum mati atau rusak', '#B58900'],
  ['Sampah', 'Tumpukan liar, TPS meluap, belum terangkut', '#4C7A34'],
  ['Banjir', 'Genangan tinggi atau luapan sungai', '#1F6F9C'],
  ['Keamanan', 'Titik rawan kriminal di fasilitas umum', '#6B4C9A'],
  ['Pohon tumbang', 'Pohon miring atau tumbang menutup jalan', '#2E7D6B']
];

const WILAYAH: Record<string, string[]> = {
  'Bima Kota': ['Rabadompu Timur', 'Paruga', 'Kumbe'],
  'Rasanae Barat': ['Kolo', 'Nae', 'Sarae'],
  'Rasanae Timur': ['Oi Mbo', 'Lampe', 'Dara']
};

const AKUN: [string, string, string, string, string][] = [
  ['Admin TANGGAP', 'admin@tanggap.id', '0811000001', 'admin', 'admin123'],
  ['Ahmad Subagja', 'ahmad@tanggap.id', '0811000002', 'petugas', 'petugas123'],
  ['Deni Kurniawan', 'deni@tanggap.id', '0811000003', 'petugas', 'petugas123'],
  ['Siti Rahmawati', 'siti@contoh.id', '0811000004', 'warga', 'warga123'],
  ['Rizky Pratama', 'rizky@contoh.id', '0811000005', 'warga', 'warga123']
];

export async function seedIfEmpty() {
  const { c } = (await one<{ c: string }>('SELECT count(*) AS c FROM users'))!;
  if (Number(c) > 0) return;

  for (const [nama, email, hp, role, pw] of AKUN) {
    await q('INSERT INTO users (nama,email,no_hp,role,password) VALUES ($1,$2,$3,$4,$5)', [
      nama, email, hp, role, await bcrypt.hash(pw, 10)
    ]);
  }
  for (const [nama, deskripsi, warna] of KATEGORI) {
    await q('INSERT INTO kategori (nama,deskripsi,warna) VALUES ($1,$2,$3)', [nama, deskripsi, warna]);
  }
  for (const [kec, desa] of Object.entries(WILAYAH)) {
    const r = await one<{ id: number }>('INSERT INTO kecamatan (nama) VALUES ($1) RETURNING id', [kec]);
    for (const d of desa) await q('INSERT INTO desa (kecamatan_id,nama) VALUES ($1,$2)', [r!.id, d]);
  }

  const users = await q<{ id: number; email: string; nama: string }>('SELECT id,email,nama FROM users');
  const uid = (e: string) => users.find((u) => u.email === e)!;
  const siti = uid('siti@contoh.id'), rizky = uid('rizky@contoh.id');
  const ahmad = uid('ahmad@tanggap.id'), deni = uid('deni@tanggap.id');

  type S = [string, number, number, number, string, string, string, number, number, string, string | null, number | null, string | null, number];
  // pelapor, kategori, kecamatan, desa, judul, uraian, alamat, lat, lng, status, petugas, dana, sumber, hariLalu
  const contoh = [
    [siti.id, 1, 1, 1, 'Lubang besar di depan pasar', 'Lubang selebar satu meter di jalur motor, sudah dua pengendara jatuh minggu ini.', 'Jl. Soekarno-Hatta, depan Pasar Amahami', -8.4602, 118.7265, 'Perbaikan', ahmad.id, 12500000, 'APBD Kota', 9],
    [rizky.id, 2, 2, 4, 'Tiga lampu jalan padam', 'Ruas jalan gelap total sejak dua minggu lalu, rawan kecelakaan malam hari.', 'Jl. Gajah Mada, Kolo', -8.4538, 118.7152, 'Survei', deni.id, null, null, 6],
    [siti.id, 3, 1, 2, 'TPS meluap sampai badan jalan', 'Sampah belum diangkut lima hari dan mulai berbau.', 'TPS Paruga, Jl. Sultan Hasanuddin', -8.4651, 118.7312, 'Selesai', deni.id, 3200000, 'Dinas Lingkungan Hidup', 20],
    [rizky.id, 4, 3, 7, 'Genangan setinggi lutut setelah hujan', 'Saluran tersumbat, air baru surut setelah enam jam.', 'Perumahan Oi Mbo blok C', -8.4707, 118.7421, 'Ditangani', ahmad.id, null, null, 3],
    [siti.id, 6, 2, 5, 'Pohon angsana miring ke arah rumah', 'Akar terangkat setelah angin kencang, dahan menjorok ke kabel listrik.', 'Jl. Pelita, Nae', -8.4489, 118.7098, 'Diverifikasi', null, null, null, 2],
    [rizky.id, 1, 3, 8, 'Aspal mengelupas sepanjang 50 meter', 'Jalan lingkungan berubah jadi kerikil lepas.', 'Jl. Lampe Raya', -8.4733, 118.7388, 'Diterima', null, null, null, 0],
    [siti.id, 5, 1, 3, 'Area parkir gelap sering ada kehilangan motor', 'Warga minta penerangan dan patroli.', 'Parkiran Taman Kumbe', -8.4625, 118.7201, 'Ditolak', null, null, null, 14]
  ] as unknown as S[];

  const urutan: Record<string, string[]> = {
    Diterima: ['Diterima'],
    Diverifikasi: ['Diterima', 'Diverifikasi'],
    Ditangani: ['Diterima', 'Diverifikasi', 'Ditangani'],
    Survei: ['Diterima', 'Diverifikasi', 'Ditangani', 'Survei'],
    Perbaikan: ['Diterima', 'Diverifikasi', 'Ditangani', 'Survei', 'Perbaikan'],
    Selesai: ['Diterima', 'Diverifikasi', 'Ditangani', 'Survei', 'Perbaikan', 'Selesai'],
    Ditolak: ['Diterima', 'Ditolak']
  };

  for (const [pel, kat, kec, des, judul, uraian, alamat, lat, lng, status, pet, dana, sumber, hari] of contoh) {
    const dibuat = new Date(Date.now() - hari * 86400000);
    const kode = await buatKode(dibuat);
    const r = await one<{ id: number }>(
      `INSERT INTO laporan (kode,pelapor_id,kategori_id,kecamatan_id,desa_id,judul,uraian,alamat,lat,lng,status,petugas_id,dana,sumber_dana,created_at,updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$15) RETURNING id`,
      [kode, pel, kat, kec, des, judul, uraian, alamat, lat, lng, status, pet, dana, sumber, dibuat]
    );
    const langkah = urutan[status];
    for (let i = 0; i < langkah.length; i++) {
      const t = new Date(dibuat.getTime() + i * 86400000 * Math.max(1, hari / langkah.length));
      await q(
        'INSERT INTO riwayat (laporan_id,status,catatan,oleh,peran,created_at) VALUES ($1,$2,$3,$4,$5,$6)',
        [r!.id, langkah[i], i === 0 ? 'Laporan masuk.' : '', i === 0 ? 'Sistem' : 'Admin TANGGAP', i === 0 ? 'warga' : 'admin', t]
      );
    }
  }
  // tanggal pembaruan terakhir = waktu riwayat terakhir, supaya "rata-rata hari sampai selesai" masuk akal
  await q(`UPDATE laporan l SET updated_at = (SELECT max(created_at) FROM riwayat r WHERE r.laporan_id = l.id)`);
  await q(
    `INSERT INTO penilaian (laporan_id,user_id,nilai,komentar) SELECT id, pelapor_id, 5, 'Cepat ditangani, terima kasih.' FROM laporan WHERE status='Selesai' LIMIT 1`
  );
  console.log('[tanggap] database kosong, data contoh dimuat');
}
