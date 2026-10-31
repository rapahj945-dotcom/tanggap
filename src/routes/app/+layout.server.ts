import { one } from '$lib/server/db';

export const load = async ({ locals }) => {
  const belum = (await one<{ c: number }>('SELECT count(*)::int AS c FROM notif WHERE user_id=$1 AND NOT dibaca', [locals.user!.id]))!.c;
  return { user: locals.user!, notifBaru: belum };
};
