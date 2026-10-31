<script lang="ts">
  import { enhance } from '$app/forms';
  let { data, form } = $props();
  let kirim = $state(false);
  let email = $state(form?.email ?? '');
  let tampilSandi = $state(false);
</script>

<svelte:head><title>Masuk — TANGGAP</title></svelte:head>

<div class="halaman">
  <aside>
    <div class="logo" aria-hidden="true">
      <span class="logo-kotak">T</span><span class="logo-teks">TANGGAP</span>
    </div>

    <article class="tiket" aria-hidden="true">
      <header class="tiket-atas">
        <span class="tiket-nomor">#TGP-0142</span>
        <span class="tiket-status">Diproses</span>
      </header>
      <p class="tiket-judul">Lampu jalan mati</p>
      <p class="tiket-lokasi">Jl. Melati, RT 04</p>
      <div class="pegang"></div>
      <ol class="tiket-langkah">
        <li class="isi"><span class="titik"></span>Laporan diterima</li>
        <li class="isi"><span class="titik"></span>Ditugaskan ke Pak Ahmad</li>
        <li><span class="titik"></span>Selesai</li>
      </ol>
    </article>

    <p class="tagline">Setiap laporan punya nomor, petugas, dan riwayat.</p>
  </aside>

  <main>
    <div class="kotak">
      <h1>Masuk</h1>
      <p class="sub">Lihat laporan milik Anda.</p>

      <form
        method="POST"
        class="isian"
        use:enhance={() => {
          kirim = true;
          return async ({ update }) => { await update(); kirim = false; };
        }}
      >
        <input type="hidden" name="lanjut" value={data.lanjut} />

        <div class="bidang">
          <label for="email">Email</label>
          <div class="input-row">
            <span class="ikonsel" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2">
                <rect x="2.5" y="4.5" width="19" height="15" /><path d="M3 6l9 7 9-7" />
              </svg>
            </span>
            <input id="email" name="email" type="email" required autocomplete="username" bind:value={email} placeholder="nama@email.com" />
          </div>
        </div>

        <div class="bidang">
          <label for="sandi">Kata sandi</label>
          <div class="input-row">
            <span class="ikonsel" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2">
                <rect x="4" y="10.5" width="16" height="10" /><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
              </svg>
            </span>
            <input id="sandi" name="sandi" type={tampilSandi ? 'text' : 'password'} required autocomplete="current-password" placeholder="Kata sandi Anda" />
            <button
              type="button"
              class="mata"
              onclick={() => (tampilSandi = !tampilSandi)}
              aria-label={tampilSandi ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            >
              {#if tampilSandi}
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
                  <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path d="M4 4l16 16"/>
                </svg>
              {:else}
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
                  <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              {/if}
            </button>
          </div>
          <p class="lupa"><a href="mailto:zainakbarrizkia@gmail.com">Lupa kata sandi?</a></p>
        </div>

        {#if form?.galat}<p class="galat" role="alert">{form.galat}</p>{/if}

        <button class="tb-masuk" disabled={kirim}>{kirim ? 'Memeriksa…' : 'Masuk'}</button>
      </form>

      <p class="bantu">Belum punya akun? <a href="/daftar">Daftar sebagai warga</a></p>

      {#if data.contoh}
        <hr class="marka-tipis" />
        <section class="contoh">
          <p class="contoh-info">Akun contoh, klik untuk mengisi otomatis</p>
          <div class="chip-baris">
            <button type="button" class="chip" onclick={() => { email = 'zainakbarrizkia@gmail.com'; const s = document.getElementById('sandi') as HTMLInputElement | null; if (s) s.value = 'admin123'; }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><rect x="3" y="5" width="18" height="12"/><path d="M8 21l2-4h4a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h1z"/></svg>
              <span class="chip-peran">Admin</span><span class="chip-email">zainakbarrizkia@gmail.com</span>
            </button>
            <button type="button" class="chip" onclick={() => { email = 'raffianzaiqbal695@gmail.com'; const s = document.getElementById('sandi') as HTMLInputElement | null; if (s) s.value = 'petugas123'; }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M3 21V9c0-3 2-6 5-6 2 0 3 1 3 3"/><circle cx="9" cy="14" r="3"/><path d="M13 9h8l-1 12h-6z"/></svg>
              <span class="chip-peran">Petugas</span><span class="chip-email">raffianzaiqbal695@gmail.com</span>
            </button>
            <button type="button" class="chip" onclick={() => { email = 'siti@contoh.id'; const s = document.getElementById('sandi') as HTMLInputElement | null; if (s) s.value = 'warga123'; }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>
              <span class="chip-peran">Warga</span><span class="chip-email">siti@contoh.id</span>
            </button>
          </div>
        </section>
      {/if}
    </div>
  </main>
</div>

<style>
  .halaman {
    min-height: 100vh;
    display: grid;
    grid-template-columns: minmax(18rem, 5fr) 7fr;
  }

  /* ===== panel kiri ===== */
  aside {
    background: var(--rambu);
    border-right: 4px dashed var(--aspal);
    padding: 2rem clamp(1.5rem, 4vw, 3.5rem);
    display: flex;
    flex-direction: column;
    gap: 2rem;
    color: var(--aspal);
  }
  .logo { display: flex; align-items: center; gap: 0.6rem; }
  .logo-kotak {
    width: 2.6rem; height: 2.6rem;
    background: var(--aspal); color: var(--rambu);
    display: grid; place-items: center;
    font: 800 1.4rem/1 var(--tampil);
    border: 2px solid var(--aspal);
    box-shadow: 4px 4px 0 var(--aspal);
  }
  .logo-teks { font: 800 1.35rem/1 var(--tampil); letter-spacing: 0.02em; }

  .tiket {
    background: #fff;
    border: 2px solid var(--aspal);
    box-shadow: 6px 6px 0 var(--aspal);
    padding: 1.1rem 1.25rem 1.3rem;
    max-width: 21rem;
    animation: tiketMasuk 0.5s ease-out 0.15s both;
  }
  .tiket-atas { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; }
  .tiket-nomor { font-family: 'Space Mono', ui-monospace, monospace; font-weight: 700; font-size: var(--skala-2); }
  .tiket-status {
    background: var(--rambu); border: 2px solid var(--aspal);
    padding: 0.15rem 0.6rem; font: 700 var(--skala-1)/1.2 var(--isi);
  }
  .tiket-judul { margin-top: 0.8rem; font: 700 1.05rem/1.2 var(--tampil); }
  .tiket-lokasi { margin-top: 0.15rem; color: var(--senyap); font-size: var(--skala-1); }
  .pegang { border-top: 2px dashed var(--aspal); margin: 1rem 0 0.9rem; }
  .tiket-langkah { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.5rem; font: 500 var(--skala-1)/1.35 var(--isi); }
  .tiket-langkah li { display: flex; align-items: center; gap: 0.5rem; }
  .titik {
    width: 0.75rem; height: 0.75rem; flex: none;
    border: 2px solid var(--aspal); background: transparent;
    display: inline-block;
  }
  .tiket-langkah li.isi .titik { background: var(--aspal); }
  .tiket-langkah li:not(.isi) { color: var(--senyap); }

  .tagline {
    margin-top: auto;
    font: 800 clamp(1.4rem, 2.6vw, 2.1rem)/1.08 var(--tampil);
    max-width: 18ch;
    animation: tiketMasuk 0.5s ease-out 0.3s both;
  }

  /* ===== panel kanan ===== */
  main {
    background: #fff8e1;
    display: grid;
    place-content: center;
    padding: clamp(2rem, 6vw, 5rem) clamp(1.25rem, 5vw, 5rem);
  }
  .kotak {
    width: min(26rem, 100%);
    animation: tiketMasuk 0.45s ease-out both;
    display: grid;
    gap: 1.15rem;
  }
  h1 { font-size: 2.125rem; letter-spacing: -0.02em; }
  .sub { color: var(--senyap); margin-top: -0.6rem; }

  .bidang { display: grid; gap: 0.35rem; }
  .bidang label { font: 700 var(--skala-1)/1 var(--isi); text-transform: uppercase; letter-spacing: 0.05em; }

  /* baris input: [ikon | input | mata] tersusun rapi, iktkad tidak tumpang tindih */
  .input-row {
    display: flex; align-items: stretch;
    height: 42px;
    border: 2px solid var(--aspal); border-radius: 0;
    background: #fff;
  }
  .ikonsel {
    flex: none; width: 42px;
    display: grid; place-items: center;
    border-right: 2px solid var(--aspal);
    color: var(--aspal);
    pointer-events: none;
  }
  .input-row input {
    flex: 1; min-width: 0;
    background: transparent; color: var(--aspal);
    border: 0; border-radius: 0;
    padding: 0 0.85rem;
    font: 500 var(--skala-2)/1 var(--isi);
  }
  .input-row input::placeholder { color: #8a8f96; }
  .input-row:focus-within { outline: 3px solid var(--rambu); outline-offset: 1px; background: #fffdf2; }
  .input-row input:-webkit-autofill,
  .input-row input:-webkit-autofill:hover,
  .input-row input:-webkit-autofill:focus {
    -webkit-text-fill-color: var(--aspal);
    box-shadow: 0 0 0 100px #fffdf2 inset;
    transition: background-color 9999s;
  }
  .mata {
    flex: none; width: 42px;
    background: transparent; color: var(--aspal);
    border: 0; border-left: 2px solid var(--aspal);
    display: grid; place-items: center;
    cursor: pointer;
  }
  .mata:hover { background: var(--rambu); color: var(--aspal); }
  .mata:focus-visible { outline: 3px solid var(--rambu); outline-offset: -3px; }

  .isian { display: grid; gap: 1.05rem; }
  .lupa { text-align: right; font-size: var(--skala-1); }
  .lupa a { font-weight: 600; text-decoration: underline; text-decoration-color: var(--garis); }
  .lupa a:hover { text-decoration-color: var(--aspal); }

  .galat {
    background: #fde4e0; color: #7a1e12;
    border: 2px solid var(--siaga);
    padding: 0.6rem 0.8rem;
    font: 600 var(--skala-1)/1.4 var(--isi);
  }

  .tb-masuk {
    width: 100%;
    background: var(--rambu); color: var(--aspal);
    border: 2px solid var(--aspal); border-radius: 0;
    box-shadow: 6px 6px 0 var(--aspal);
    padding: 0.7rem 1rem;
    font: 700 var(--skala-3)/1 var(--tampil);
    cursor: pointer;
    transition: transform 0.08s ease, box-shadow 0.08s ease;
  }
  .tb-masuk:hover { transform: translate(2px, 2px); box-shadow: 3px 3px 0 var(--aspal); }
  .tb-masuk:active { transform: translate(5px, 5px); box-shadow: 0 0 0 var(--aspal); }
  .tb-masuk:disabled { opacity: 0.65; cursor: wait; }

  .bantu { font-size: var(--skala-2); }
  .bantu a { font-weight: 700; text-decoration: underline; text-decoration-color: var(--garis); }
  .bantu a:hover { text-decoration-color: var(--aspal); }

  .marka-tipis { margin: 0.25rem 0; border: 0; height: 1px; background: repeating-linear-gradient(90deg, var(--garis) 0 6px, transparent 6px 11px); }

  .contoh { display: grid; gap: 0.6rem; }
  .contoh-info { font: 600 var(--skala-1)/1 var(--isi); text-transform: uppercase; letter-spacing: 0.05em; }
  .chip-baris { display: grid; gap: 0.5rem; }
  .chip {
    display: flex; align-items: center; gap: 0.55rem;
    background: #fff; color: var(--aspal);
    border: 2px solid var(--aspal); border-radius: 0;
    padding: 0.45rem 0.7rem;
    font: 500 var(--skala-1)/1.2 var(--isi);
    text-align: left; cursor: pointer; width: 100%;
    transition: background 0.12s ease;
  }
  .chip:hover, .chip:focus-visible { background: var(--rambu); }
  .chip-peran { font-weight: 700; flex: none; }
  .chip-email { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--senyap); }
  .chip:hover .chip-email, .chip:focus-visible .chip-email { color: var(--aspal); }

  @keyframes tiketMasuk {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: none; }
  }

  @media (prefers-reduced-motion: reduce) {
    .tiket, .tagline, .kotak { animation: none; }
    .tb-masuk { transition: none; }
  }

  @media (max-width: 768px) {
    .halaman { grid-template-columns: 1fr; }
    aside {
      border-right: 0; border-bottom: 4px dashed var(--aspal);
      padding-bottom: 1.25rem; gap: 1rem;
    }
    .tiket { display: none; }
    .tagline { margin-top: 0; font-size: var(--skala-4); }
  }
</style>
