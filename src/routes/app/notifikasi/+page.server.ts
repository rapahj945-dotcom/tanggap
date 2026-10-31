import { fail } from '@sveltejs/kit';
import { q } from '$lib/server/db';

export const load = async ({ locals }) => {
  const daftar = await q(
    `SELECT n.id,n.teks,n.tautan,n.dibaca,n.created_at,l.kode
     FROM notif n LEFT JOIN laporan l ON l.id=n.laporan_id
     WHERE n.user_id=$1 ORDER BY NOT n.dibaca, n.created_at DESC LIMIT 100`,
    [locals.user!.id]
  );
  return { daftar };
};

export const actions = {
  tandai: async ({ locals }) => {
    await q('UPDATE notif SET dibaca=TRUE WHERE user_id=$1 AND NOT dibaca', [locals.user!.id]);
    return { ok: true };
  },
  hapus: async ({ request, locals }) => {
    const f = await request.formData();
    const id = Number(f.get('id'));
    if (!id) return fail(400);
    await q('DELETE FROM notif WHERE id=$1 AND user_id=$2', [id, locals.user!.id]);
    return { ok: true };
  }
};
