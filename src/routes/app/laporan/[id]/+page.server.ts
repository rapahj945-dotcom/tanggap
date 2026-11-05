import { error, fail, redirect } from '@sveltejs/kit';
import { q, one, pool } from '$lib/server/db';
import { STATUS } from '$lib/server/laporan';
import { simpanFoto } from '$lib/server/upload';
import { beritahu } from '$lib/server/beritahu';

async function muat(id: number, u: { id: number; role: string }) {
  const l = await one(
    `SELECT l.*, k.nama AS kategori, k.warna, kc.nama AS kecamatan, d.nama AS desa, pt.nama AS petugas, pl.nama AS pelapor, pl.no_hp AS hp_pelapor
     FROM laporan l JOIN kategori k ON k.id=l.kategori_id
     LEFT JOIN kecamatan kc ON kc.id=l.kecamatan_id LEFT JOIN desa d ON d.id=l.desa_id
     LEFT JOIN users pt ON pt.id=l.petugas_id JOIN users pl ON pl.id=l.pelapor_id WHERE l.id=$1`,
    [id]
  );
  if (!l) error(404, 'Laporan tidak ditemukan');
  if (u.role === 'warga' && l.pelapor_id !== u.id) error(403, 'Ini bukan laporan Anda');
  if (u.role === 'petugas' && l.petugas_id !== u.id) error(403, 'Laporan ini belum ditugaskan kepada Anda');
  return l;
}

export const load = async ({ params, locals }) => {
  const u = locals.user!;
  const l = await muat(Number(params.id), u);
  const riwayat = await q('SELECT status,catatan,oleh,peran,created_at FROM riwayat WHERE laporan_id=$1 ORDER BY created_at,id', [l.id]);
  const nilai = await one('SELECT nilai,komentar FROM penilaian WHERE laporan_id=$1', [l.id]);
  const petugas = u.role === 'admin' ? await q(`SELECT id,nama FROM users WHERE role='petugas' AND aktif ORDER BY nama`) : [];
  return {
    l: { ...l, hp_pelapor: u.role === 'warga' ? null : l.hp_pelapor },
    riwayat, nilai, petugas,
    statusBoleh: u.role === 'admin' ? STATUS : STATUS.filter((s) => ['Ditangani', 'Survei', 'Perbaikan', 'Selesai'].includes(s))
  };
};

export const actions = {
  status: async ({ params, request, locals }) => {
    const u = locals.user!;
    if (u.role === 'warga') error(403);
    const l = await muat(Number(params.id), u);
    const f = await request.formData();
    const status = String(f.get('status'));
    const catatan = String(f.get('catatan') ?? '').trim();
    const bolehStatus = u.role === 'admin' ? (STATUS as readonly string[]) : ['Ditangani', 'Survei', 'Perbaikan', 'Selesai'];
    if (!bolehStatus.includes(status)) return fail(400, { galat: 'Status tidak valid untuk peran Anda.' });
    if (status === 'Ditolak' && catatan.length < 5) return fail(400, { galat: 'Tulis alasan penolakan agar pelapor paham.' });

    let petugasId: number | null = l.petugas_id;
    if (u.role === 'admin' && f.has('petugas_id')) {
      const p = Number(f.get('petugas_id')) || null;
      if (p && !(await one(`SELECT 1 FROM users WHERE id=$1 AND role='petugas' AND aktif`, [p]))) return fail(400, { galat: 'Petugas tidak valid.' });
      petugasId = p;
    }
    const danaRaw = String(f.get('dana') ?? '').replace(/[^\d]/g, '');
    const dana = danaRaw ? Number(danaRaw) : null;
    if (dana != null && dana > 1e13) return fail(400, { galat: 'Nominal dana terlalu besar.' });
    const sumber = String(f.get('sumber_dana') ?? '').trim() || null;

    let fotoSesudah: string | null = null;
    try { fotoSesudah = await simpanFoto(f.get('foto_sesudah')); } catch (e) { return fail(400, { galat: (e as Error).message }); }

    const klien = await pool.connect();
    try {
      await klien.query('BEGIN');
      await klien.query(
        `UPDATE laporan SET status=$2, petugas_id=$3, dana=$4, sumber_dana=$5, foto_sesudah=COALESCE($6,foto_sesudah), updated_at=now() WHERE id=$1`,
        [l.id, status, petugasId, dana, sumber, fotoSesudah]
      );
      const adaPerubahan = status !== l.status || catatan || petugasId !== l.petugas_id;
      if (adaPerubahan) {
        await klien.query('INSERT INTO riwayat (laporan_id,status,catatan,oleh,oleh_id,peran) VALUES ($1,$2,$3,$4,$6,$5)', [l.id, status, catatan, u.nama, u.role, u.id]);
        if (status !== l.status) {
          await beritahu(klien as never, l.pelapor_id !== u.id ? l.pelapor_id : null, l.id, `Status laporan "${l.judul}" kini ${status}.`, `/app/laporan/${l.id}`);
          if (petugasId && petugasId !== l.petugas_id) {
            await beritahu(klien as never, petugasId, l.id, `Anda ditugaskan menangani "${l.judul}".`, `/app/laporan/${l.id}`);
          }
        }
      }
      await klien.query('COMMIT');
    } catch (e) {
      await klien.query('ROLLBACK');
      throw e;
    } finally {
      klien.release();
    }
    return { ok: 'Perubahan disimpan.' };
  },

  nilai: async ({ params, request, locals }) => {
    const u = locals.user!;
    const l = await muat(Number(params.id), u);
    if (u.role !== 'warga') error(403);
    if (l.status !== 'Selesai') return fail(400, { galat: 'Penilaian dibuka setelah laporan selesai.' });
    const f = await request.formData();
    const nilai = Number(f.get('nilai'));
    if (!Number.isInteger(nilai) || nilai < 1 || nilai > 5) return fail(400, { galat: 'Pilih nilai 1 sampai 5.' });
    await q(
      `INSERT INTO penilaian (laporan_id,user_id,nilai,komentar) VALUES ($1,$2,$3,$4) ON CONFLICT (laporan_id) DO NOTHING`,
      [l.id, u.id, nilai, String(f.get('komentar') ?? '').trim().slice(0, 500)]
    );
    return { ok: 'Terima kasih, penilaian Anda tercatat.' };
  },

  hapus: async ({ params, locals }) => {
    const u = locals.user!;
    if (u.role !== 'admin') error(403);
    await q('DELETE FROM laporan WHERE id=$1', [Number(params.id)]);
    redirect(303, '/app/laporan');
  }
};
