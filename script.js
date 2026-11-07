(() => {
  const canvas = document.getElementById('smokeCanvas');
  const ctx = canvas.getContext('2d');
  const stage = document.getElementById('stage');
  const cigarette = document.getElementById('cigaretteWrap');
  const crosshair = document.getElementById('crosshair');
  const toggle = document.getElementById('smokeToggle');
  const toggleText = document.getElementById('toggleText');
  const replay = document.getElementById('replayButton');
  const quoteText = document.getElementById('quoteText');
  const quoteCount = document.getElementById('quoteCount');
  const quoteNext = document.getElementById('quoteNext');
  const quotes = [
    'Even the longest night is made of moments that pass.',
    'Some things are beautiful because they do not stay.',
    'The air remembers what the hands let go.',
    'A little light can make a long shadow.',
    'Not every spark is a beginning; some are simply a reminder.',
    'Let the moment pass. Keep what it taught you.'
  ];
  let quoteIndex = 0;

  let width = 0, height = 0, running = true, particles = [], pointer = { x: 0.5, y: 0.5 };
  let lastTime = 0, elapsed = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    const rect = stage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width; height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeParticle(initial = false) {
    const originX = width * 0.72;
    const originY = height * 0.47;
    return {
      x: originX + (Math.random() - .5) * 12,
      y: originY + (initial ? Math.random() * height * .62 : 0),
      vx: (Math.random() - .5) * .22,
      vy: -(0.35 + Math.random() * .55),
      size: 12 + Math.random() * 25,
      life: initial ? Math.random() * 1.5 : 0,
      maxLife: 2.4 + Math.random() * 2.2,
      phase: Math.random() * Math.PI * 2,
      drift: .3 + Math.random() * .8
    };
  }

  function reset() {
    particles = [];
    for (let i = 0; i < 38; i++) particles.push(makeParticle(true));
  }

  function drawParticle(p, dt) {
    p.life += dt;
    const progress = p.life / p.maxLife;
    const sway = Math.sin(elapsed * .75 + p.phase) * p.drift;
    p.x += (p.vx + sway * .11 + (pointer.x - .5) * .32) * dt * 28;
    p.y += p.vy * dt * 28;
    p.size += dt * 3.2;

    const fadeIn = Math.min(1, progress * 4);
    const fadeOut = Math.max(0, 1 - Math.pow(progress, 1.7));
    const alpha = .075 * fadeIn * fadeOut;
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
    gradient.addColorStop(0, `rgba(205, 202, 193, ${alpha})`);
    gradient.addColorStop(.45, `rgba(167, 169, 166, ${alpha * .55})`);
    gradient.addColorStop(1, 'rgba(130, 135, 137, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    return progress < 1.15 && p.y > -p.size * 2;
  }

  function render(time) {
    const dt = Math.min((time - (lastTime || time)) / 1000, .04);
    lastTime = time;
    if (running) elapsed += dt;
    ctx.clearRect(0, 0, width, height);

    if (running) {
      if (particles.length < 58 && Math.random() < .8) particles.push(makeParticle());
      particles = particles.filter(p => drawParticle(p, dt));
    } else {
      particles.forEach(p => drawParticle(p, 0));
    }
    requestAnimationFrame(render);
  }

  stage.addEventListener('pointermove', (event) => {
    const rect = stage.getBoundingClientRect();
    pointer.x = (event.clientX - rect.left) / rect.width;
    pointer.y = (event.clientY - rect.top) / rect.height;
    const dx = (pointer.x - .5) * 17;
    const dy = (pointer.y - .5) * 12;
    cigarette.style.setProperty('--mx', `${dx}px`);
    cigarette.style.setProperty('--my', `${dy}px`);
    crosshair.style.left = `${event.clientX - rect.left}px`;
    crosshair.style.top = `${event.clientY - rect.top}px`;
  });

  stage.addEventListener('pointerleave', () => {
    cigarette.style.setProperty('--mx', '0px');
    cigarette.style.setProperty('--my', '0px');
    crosshair.style.opacity = '0';
  });

  quoteNext.addEventListener('click', () => {
    quoteText.classList.add('changing');
    window.setTimeout(() => {
      quoteIndex = (quoteIndex + 1) % quotes.length;
      quoteText.textContent = quotes[quoteIndex];
      quoteCount.textContent = `LINE ${String(quoteIndex + 1).padStart(2, '0')} / ${String(quotes.length).padStart(2, '0')}`;
      quoteText.classList.remove('changing');
    }, 180);
  });

  toggle.addEventListener('click', () => {
    running = !running;
    toggle.setAttribute('aria-pressed', String(running));
    toggleText.textContent = `SMOKE: ${running ? 'ON' : 'PAUSED'}`;
  });

  replay.addEventListener('click', () => {
    elapsed = 0;
    reset();
    cigarette.animate(
      [{ transform: 'translate(-50%, -50%) rotate(-12deg) scale(1)' },
       { transform: 'translate(-50%, -50%) rotate(-12deg) scale(1.035)' },
       { transform: 'translate(-50%, -50%) rotate(-12deg) scale(1)' }],
      { duration: 420, easing: 'ease-out' }
    );
  });

  if (reducedMotion) running = false;
  resize();
  reset();
  window.addEventListener('resize', resize);
  requestAnimationFrame(render);
})(); 
