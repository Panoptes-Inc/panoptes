<script>
  import LandingHeroPrimaryVisual from '$lib/features/landing/components/LandingHeroPrimaryVisual.svelte';
  import AppTopDummy from '$lib/components/ComponentsBase/AppTopDummy.svelte';
</script>

<section class="hero-first">
  <LandingHeroPrimaryVisual />

  <div class="app-dummy">
    <AppTopDummy />
  </div>
</section>

<style>
  .hero-first {
    position: relative;
  }

  .app-dummy {
    position: absolute;
    zoom: 0.6;
    right: 4%;
    bottom: 6%;
    background-color: #f9f6f4;
    border-radius: 16px;
    box-shadow:
      #00000032 0 0 32px 32px,
      #00000040 0 0 16px 8px;
  }
</style>
