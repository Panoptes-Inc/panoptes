<script>
  import LandingHeroSecondaryVisual from '$lib/features/landing/components/LandingHeroSecondaryVisual.svelte';
  import AppResultsDummy from '$lib/components/ComponentsBase/AppResultsDummy.svelte';
</script>

<section class="hero-second">
  <LandingHeroSecondaryVisual />

  <div class="app-dummy">
    <AppResultsDummy />
  </div>
</section>

<style>
  .hero-second {
    position: relative;
  }

  .app-dummy {
    position: absolute;
    zoom: 0.6;
    left: 4%;
    bottom: 6%;
    background-color: #f9f6f4;
    border-radius: 16px;
    box-shadow:
      #00000032 0 0 32px 32px,
      #00000040 0 0 16px 8px;
  }
</style>
