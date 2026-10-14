<script>
  import PanoptesTopSearchArea from '$lib/components/ComponentsBase/PanoptesTopSearchArea.svelte';
  import PanoptesTopHeroBrand from './PanoptesTopHeroBrand.svelte';
</script>

<section class="top-hero" aria-label="Panoptes app top">
  <div class="hero-stage">
    <PanoptesTopHeroBrand />
    <PanoptesTopSearchArea />
    <p class="note">外部推定データは使用しません。</p>
  </div>
</section>

<style>
  .top-hero {
    min-height: clamp(520px, 70vh, 760px);
    display: grid;
    place-items: center;
    padding: 24px 24px 0;
  }

  .hero-stage {
    width: min(420px, 100%);
    display: grid;
    justify-items: center;
    gap: 18px;
  }

  .note {
    margin: 0;
    color: #ff8a42;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
  }

  @media (max-width: 720px) {
    .top-hero {
      min-height: auto;
      padding-inline: 16px;
      padding-top: 12px;
    }

    .hero-stage {
      gap: 16px;
    }
  }
</style>
