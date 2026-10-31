/**
 * Pembatas laju sederhana dalam memori: jendela geser per kunci.
 * Cukup untuk satu instansi; untuk multi-instansi pindahkan ke tabel PostgreSQL.
 */
const tabir = new Map<string, number[]>();

export function lewat(kunci: string, maks: number, jendelaMs: number): boolean {
  const kini = Date.now();
  const t = (tabir.get(kunci) ?? []).filter((x) => kini - x < jendelaMs);
  if (t.length >= maks) {
    tabir.set(kunci, t);
    return false;
  }
  t.push(kini);
  tabir.set(kunci, t);
  if (tabir.size > 5000) tabir.clear();
  return true;
}

/** 5 percobaan masuk per 10 menit per IP */
export const bolehMasuk = (ip: string) => lewat(`masuk:${ip}`, 5, 10 * 60_000);
/** 3 pendaftaran per jam per IP */
export const bolehDaftar = (ip: string) => lewat(`daftar:${ip}`, 3, 60 * 60_000);
/** 5 laporan per hari per pengguna */
export const bolehLapor = (userId: number | string) => lewat(`lapor:${userId}`, 5, 24 * 60 * 60_000);
