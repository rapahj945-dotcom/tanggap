<script lang="ts">
  import { hariLalu } from '$lib/format';
  let { data, form } = $props();
</script>

<svelte:head><title>Notifikasi – TANGGAP</title></svelte:head>

<header class="kepala">
  <h1>Notifikasi</h1>
  <form method="POST" action="?/tandai"><button class="btn kecil">Tandai semua dibaca</button></form>
</header>
<hr class="marka" />

{#if data.daftar.length === 0}
  <p class="kosong">Belum ada notifikasi. Perubahan status laporan dan penugasan akan muncul di sini.</p>
{:else}
  <ul>
    {#each data.daftar as n}
      <li class:sudah={n.dibaca} class:baru={!n.dibaca}>
        <a href={n.tautan || '/app'} class="teks">
          {n.teks}
          <span class="kode">{n.kode ? n.kode + ' · ' : ''}#</span>
          <span class="kode">{hariLalu(n.created_at)}</span>
        </a>
        <form method="POST" action="?/hapus"><input type="hidden" name="id" value={n.id} /><button class="btn kecil" aria-label="Hapus notifikasi">×</button></form>
      </li>
    {/each}
  </ul>
{/if}

{#if form?.ok}<p class="kosong">Semua ditandai dibaca.</p>{/if}

<style>
  .kepala { display: flex; align-items: center; gap: 1.5rem; padding-bottom: 1rem; }
  h1 { font-size: var(--skala-5); font-weight: 800; }
  .kepala form { margin-left: auto; }
  .sudah { color: var(--senyap); }
  .baru { border-left: 5px solid var(--rambu); }
  ul { list-style: none; padding: 1rem 0; }
  li { display: flex; gap: 1rem; align-items: center; padding: 0.85rem 0.6rem; border-bottom: 1px dashed var(--garis); }
  li a { flex: 1; text-decoration: none; min-width: 0; }
  .teks { font-size: var(--skala-2); overflow-wrap: anywhere; }
  .kode { display: inline-block; margin-left: 0.6rem; color: var(--senyap); font-size: var(--skala-1); }
  .kosong { color: var(--senyap); padding: 2rem 0; }
</style>
