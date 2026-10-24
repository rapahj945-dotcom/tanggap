import { redirect, type Handle } from '@sveltejs/kit';
import { migrate } from '$lib/server/db';
import { seedIfEmpty } from '$lib/server/seed';
import { readSession } from '$lib/server/auth';

const ready = (async () => {
  await migrate();
  await seedIfEmpty();
})();
ready.catch((e) => console.error('[tanggap] gagal inisialisasi database', e));

export const handle: Handle = async ({ event, resolve }) => {
  await ready;
  event.locals.user = await readSession(event.cookies);
  if (event.url.pathname.startsWith('/app') && !event.locals.user) {
    redirect(303, `/masuk?lanjut=${encodeURIComponent(event.url.pathname)}`);
  }
  return resolve(event);
};
