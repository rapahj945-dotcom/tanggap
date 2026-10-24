export const rupiah = (n: number | null | undefined) =>
  n == null ? '–' : 'Rp ' + new Intl.NumberFormat('id-ID').format(n);

export const rupiahRingkas = (n: number) => {
  if (n >= 1e9) return `Rp ${(n / 1e9).toFixed(1).replace('.', ',')} miliar`;
  if (n >= 1e6) return `Rp ${(n / 1e6).toFixed(1).replace('.', ',')} juta`;
  return rupiah(n);
};

export const tanggal = (d: string | Date) =>
  new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d));

export const tanggalJam = (d: string | Date) =>
  new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(d));

export const hariLalu = (d: string | Date) => {
  const h = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  return h <= 0 ? 'hari ini' : h === 1 ? 'kemarin' : `${h} hari lalu`;
};

export const TAHAP = ['Diterima', 'Diverifikasi', 'Ditangani', 'Survei', 'Perbaikan', 'Selesai'];
export const WARNA_STATUS: Record<string, string> = {
  Diterima: '#6b7178',
  Diverifikasi: '#1f6f9c',
  Ditangani: '#1f6f9c',
  Survei: '#6b4c9a',
  Perbaikan: '#c8851e',
  Selesai: '#2f6b4f',
  Ditolak: '#d2432b'
};
export const ROLE_LABEL: Record<string, string> = { admin: 'Administrator', petugas: 'Petugas lapangan', warga: 'Warga' };
