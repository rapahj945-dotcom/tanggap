<script lang="ts">
  import { onMount } from 'svelte';
  import type { Map as LMap, Marker } from 'leaflet';

  type Titik = { id: number; kode: string; judul: string; lat: number; lng: number; warna: string; status: string };
  let {
    titik = [],
    pilih = false,
    lat = $bindable<number | null>(null),
    lng = $bindable<number | null>(null),
    tinggi = '28rem'
  }: { titik?: Titik[]; pilih?: boolean; lat?: number | null; lng?: number | null; tinggi?: string } = $props();

  let el: HTMLDivElement;
  let peta: LMap;
  let penanda: Marker | null = null;
  let L: typeof import('leaflet');

  const ikon = (warna: string) =>
    L.divIcon({
      className: '',
      html: `<span style="display:block;width:16px;height:16px;border-radius:50%;background:${warna};border:3px solid #1b1f23;box-shadow:0 0 0 2px #f5c400"></span>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

  onMount(() => {
    let hapus = false;
    (async () => {
      L = (await import('leaflet')).default;
      if (hapus) return;
      const pusat: [number, number] = lat != null && lng != null ? [lat, lng] : titik.length ? [titik[0].lat, titik[0].lng] : [-8.46, 118.727];
      peta = L.map(el, { zoomControl: true, attributionControl: true }).setView(pusat, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(peta);

      if (pilih) {
        if (lat != null && lng != null) penanda = L.marker([lat, lng], { icon: ikon('#f5c400') }).addTo(peta);
        peta.on('click', (e) => {
          lat = +e.latlng.lat.toFixed(6);
          lng = +e.latlng.lng.toFixed(6);
          if (penanda) penanda.setLatLng(e.latlng);
          else penanda = L.marker(e.latlng, { icon: ikon('#f5c400') }).addTo(peta);
        });
      } else {
        const grup: [number, number][] = [];
        for (const t of titik) {
          grup.push([t.lat, t.lng]);
          L.marker([t.lat, t.lng], { icon: ikon(t.warna) })
            .addTo(peta)
            .bindPopup(`<strong>${t.kode}</strong><br>${t.judul.replace(/</g, '&lt;')}<br><a href="/app/laporan/${t.id}">${t.status} – buka</a>`);
        }
        if (grup.length > 1) peta.fitBounds(grup, { padding: [40, 40] });
      }
    })();
    return () => { hapus = true; peta?.remove(); };
  });

  function lokasiSaya() {
    navigator.geolocation?.getCurrentPosition((p) => {
      lat = +p.coords.latitude.toFixed(6);
      lng = +p.coords.longitude.toFixed(6);
      peta.setView([lat, lng], 17);
      if (penanda) penanda.setLatLng([lat, lng]);
      else penanda = L.marker([lat, lng], { icon: ikon('#f5c400') }).addTo(peta);
    });
  }
</script>

<div class="peta" style:height={tinggi} bind:this={el}></div>
{#if pilih}
  <p class="bantu baris">
    {#if lat != null && lng != null}Titik dipilih: <span class="num">{lat}, {lng}</span>{:else}Ketuk peta untuk menandai lokasi.{/if}
    <button type="button" class="btn kecil" onclick={lokasiSaya}>Pakai lokasi saya</button>
  </p>
{/if}

<style>
  .peta { width: 100%; border-top: 3px solid var(--aspal); border-bottom: 3px solid var(--aspal); background: var(--kapur-dalam); }
  .baris { display: flex; gap: 1rem; align-items: center; margin-top: 0.6rem; flex-wrap: wrap; }
</style>
