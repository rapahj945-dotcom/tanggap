<script lang="ts">
  import { enhance } from '$app/forms';
  import Merek from '$lib/components/Merek.svelte';
  let { data, form } = $props();
  let kirim = $state(false);
</script>

<svelte:head><title>Masuk – TANGGAP</title></svelte:head>
<div class="halaman">
  <aside>
    <Merek />
    <p>Setiap laporan punya nomor, petugas, dan riwayat. Masuk untuk melihat milik Anda.</p>
    <div class="jalan" aria-hidden="true"></div>
  </aside>
  <main>
    <h1>Masuk</h1>
    <form method="POST" class="isian" use:enhance={() => { kirim = true; return async ({ update }) => { await update(); kirim = false; }; }}>
      <input type="hidden" name="lanjut" value={data.lanjut} />
      <div class="bidang"><label for="email">Email</label><input id="email" name="email" type="email" required autocomplete="username" value={form?.email ?? ''} /></div>
      <div class="bidang"><label for="sandi">Kata sandi</label><input id="sandi" name="sandi" type="password" required autocomplete="current-password" /></div>
      {#if form?.galat}<p class="galat" role="alert">{form.galat}</p>{/if}
      <div><button class="btn utama" disabled={kirim}>{kirim ? 'Memeriksa…' : 'Masuk'}</button></div>
    </form>
    <p class="bantu">Belum punya akun? <a href="/daftar">Daftar sebagai warga</a></p>

    {#if data.contoh}
      <section class="contoh">
        <hr class="marka-tipis" />
        <p class="bantu">Akun contoh untuk percobaan:</p>
        <table>
          <tbody>
            <tr><td>admin@tanggap.id</td><td>admin123</td></tr>
            <tr><td>ahmad@tanggap.id</td><td>petugas123</td></tr>
            <tr><td>siti@contoh.id</td><td>warga123</td></tr>
          </tbody>
        </table>
      </section>
    {/if}
  </main>
</div>

<style>
  .halaman { min-height: 100vh; display: grid; grid-template-columns: minmax(16rem, 5fr) 7fr; }
  aside { background: var(--rambu); padding: 2rem clamp(1.25rem, 4vw, 3.5rem); display: flex; flex-direction: column; gap: 2rem; position: relative; }
  aside p { font: 800 var(--skala-5)/1.05 var(--tampil); max-width: 14ch; margin-top: auto; }
  .jalan { position: absolute; right: 0; top: 0; bottom: 0; width: 6px; background: repeating-linear-gradient(180deg, var(--aspal) 0 22px, transparent 22px 40px); }
  main { padding: clamp(2rem, 8vw, 6rem) clamp(1.25rem, 5vw, 5rem); max-width: 40rem; display: grid; gap: 1.75rem; align-content: start; }
  h1 { font-size: var(--skala-6); font-weight: 800; }
  .contoh td { padding: 0.35rem 1rem 0.35rem 0; border: 0; font-size: var(--skala-1); }
  @media (max-width: 760px) { .halaman { grid-template-columns: 1fr; } aside { padding-bottom: 1.25rem; } aside p { font-size: var(--skala-4); margin-top: 0; } .jalan { display: none; } }
</style>
