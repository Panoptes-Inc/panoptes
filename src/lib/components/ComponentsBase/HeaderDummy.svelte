<script>
  let { activePath = '/app' } = $props();

  function normalizePath(pathname) {
    if (!pathname) return '/';
    if (pathname === '/') return '/';
    return pathname.replace(/\/+$/, '') || '/';
  }

  function isActive(pathname) {
    const current = normalizePath(activePath);
    if (pathname === '/') return current === '/';
    if (pathname === '/app') return current === '/app';
    return current.startsWith(pathname);
  }
</script>

<header class="header">
  <div class="logo-area">
    <img src="/logo/panoptes-logo.svg" alt="Panoptes" class="app-logo" />
  </div>

  <div class="header-right">
    <nav class="header-menu" aria-label="グローバルナビゲーション">
      <a href="/" class:active={isActive('/')}>パノプテスについて</a>
      <a href="/app" class:active={isActive('/app')}>アプリTOP</a>
      <a href="/app/survey" class:active={isActive('/app/survey')}>アンケート</a>
      <a href="/app/contact" class:active={isActive('/app/contact')}>お問い合わせ</a>
      <a href="/app/share" class:active={isActive('/app/share')}>QRコードでアプリを共有</a>
    </nav>

    <a class="login-button" href="/app/login" aria-label="ログイン">
      <img src="/icons/Login.svg" alt="" class="login-icon" />
    </a>
  </div>
</header>

<style>
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 10px 16px;
    gap: 18px;
    min-height: 62px;
  }

  .logo-area {
    flex: 0 0 auto;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: auto;
    min-width: 0;
  }

  .header-menu {
    display: flex;
    gap: 32px;
    align-items: center;
    min-height: 48px;
    padding: 8px 48px;
    border-radius: 999px;
    position: relative;
    z-index: 0;
    isolation: isolate;
  }

  .header-menu::before,
  .header-menu::after {
    content: '';
    position: absolute;
    border-radius: inherit;
    z-index: -1;
  }

  .header-menu::before {
    inset: 0;
    background: linear-gradient(45deg, #564aff, #ff6200, #bcb7ff, #ff6200, #564aff);
    background-size: 400% 100%;
    background-position: 0% 50%;
    animation: glow 24s linear infinite;
  }

  .header-menu::after {
    inset: 2px;
    background-color: #fff;
  }

  @keyframes glow {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  .header-menu a {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    border-radius: 99px;
    text-decoration: none;
    font-size: 12px;
    white-space: nowrap;
    color: #2d2d2d;
    background: transparent;
    outline: none;
    z-index: 0;
    isolation: isolate;
    transition: background 0.2s ease, color 0.15s ease, box-shadow 0.2s ease, transform 0.2s ease;
  }

  .header-menu a.active {
    background: linear-gradient(90deg, #dedbff, #edebff);
    color: #5a4eff;
  }

  .header-menu a:focus-visible:not(:hover)::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: inherit;
    background: linear-gradient(45deg, #564aff, #ff6200, #bcb7ff, #ff6200, #564aff);
    background-size: 300% 300%;
    animation: glow 12s linear infinite;
    padding: 2px;
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    mask-composite: exclude;
    z-index: -1;
    pointer-events: none;
  }

  .header-menu a:hover,
  .header-menu a:focus-visible:hover,
  .header-menu a.active:hover,
  .header-menu a.active:focus-visible:hover {
    background: linear-gradient(90deg, #564aff, #8b83ff);
    color: #fff;
  }

  .login-button {
    --ring: 2px;

    width: 88px;
    height: 40px;
    border-radius: 999px;
    position: relative;
    display: grid;
    place-items: center;
    text-decoration: none;
    isolation: isolate;
    background: linear-gradient(135deg, #ff8d2f, #ff6200);
    box-shadow: 0 6px 18px rgba(255, 98, 0, 0.24);
  }

  .login-button::before {
    content: '';
    position: absolute;
    inset: calc(-1 * var(--ring));
    border-radius: inherit;
    background: linear-gradient(45deg, #564aff, #ff6200, #bcb7ff, #ff6200, #564aff);
    background-size: 300% 300%;
    background-position: 0% 50%;
    animation: glow 12s linear infinite;
    padding: var(--ring);
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    mask-composite: exclude;
    z-index: -1;
    pointer-events: none;
  }

  .login-button:hover {
    filter: brightness(1.04);
    transform: translateY(-1px);
  }

  .login-button:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 3px rgba(86, 74, 255, 0.18),
      0 6px 18px rgba(255, 98, 0, 0.24);
  }

  .login-icon {
    width: 24px;
    height: 24px;
    display: block;
  }

  .app-logo {
    height: 46px;
    display: block;
  }

  @media (max-width: 1280px) {
    .header-menu {
      gap: 22px;
      padding: 4px 30px;
    }

    .header-menu a {
      font-size: 11px;
      padding: 7px 12px;
    }
  }

  @media (max-width: 980px) {
    .header-menu a:nth-child(n + 5) {
      display: none;
    }

    .header-menu {
      gap: 14px;
      padding: 4px 20px;
    }
  }
</style>
