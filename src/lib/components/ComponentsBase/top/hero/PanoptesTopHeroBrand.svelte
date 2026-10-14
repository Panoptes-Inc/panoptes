<script>
  import AppLogo from '$lib/components/loop/AppLogo.svelte';
</script>

<section class="hero-brand">
  <div class="logo-wrap">
    <AppLogo />
  </div>

  <div class="copy">
    <p class="lead">構造を分析し、戦略を診断する。</p>
    <p class="sub">
      競合・業界・自社を統合分析し、
      <br />
      優先施策まで提示します。
    </p>
  </div>
</section>

<style>
  .hero-brand {
    display: grid;
    justify-items: center;
    gap: 12px;
  }

  .logo-wrap {
    display: grid;
    justify-items: center;
  }

  .copy {
    display: grid;
    gap: 6px;
    text-align: center;
  }

  .lead,
  .sub {
    margin: 0;
  }

  .lead {
    color: #4a433d;
    font-size: 19px;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  .sub {
    color: #7f756d;
    font-size: 14px;
    line-height: 1.65;
  }

  @media (max-width: 720px) {
    .lead {
      font-size: 17px;
    }

    .sub {
      font-size: 13px;
    }
  }
</style>
