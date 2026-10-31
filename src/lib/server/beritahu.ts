import type pg from 'pg';

/** Kirim notifikasi dalam aplikasi ke satu atau banyak pengguna. */
export async function beritahu(
  klien: pg.PoolClient | { query: pg.Pool['query'] },
  userId: number | null | undefined,
  laporanId: number,
  teks: string,
  tautan = ''
) {
  if (!userId) return;
  await (klien as pg.PoolClient).query(
    'INSERT INTO notif (user_id,laporan_id,teks,tautan) VALUES ($1,$2,$3,$4)',
    [userId, laporanId, teks.slice(0, 300), tautan]
  );
}

/** Notifikasi untuk semua administrator (misal laporan baru masuk). */
export async function beritahuAdmin(
  klien: pg.PoolClient | { query: pg.Pool['query'] },
  laporanId: number,
  teks: string,
  tautan = ''
) {
  await (klien as pg.PoolClient).query(
    `INSERT INTO notif (user_id,laporan_id,teks,tautan)
     SELECT id,$1::int,$2,$3 FROM users WHERE role='admin' AND aktif`,
    [laporanId, teks, tautan]
  );
}
