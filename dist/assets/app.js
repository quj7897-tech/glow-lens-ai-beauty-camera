(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  // Branded page entrance: quick enough for repeat visits, but gives the proposal a deliberate opening beat.
  const loader = $('.site-loader');
  const loaderNumber = $('#loaderNumber');
  if (loader && !reduced) {
    let value = 0;
    const loading = setInterval(() => {
      value = Math.min(100, value + Math.ceil((100 - value) * .18));
      loaderNumber.textContent = value;
      loader.style.setProperty('--loader', `${value}%`);
      if (value >= 100) {
        clearInterval(loading);
        setTimeout(() => {
          loader.classList.add('loaded');
          setTimeout(() => loader.classList.add('done'), 900);
        }, 180);
      }
    }, 48);
  } else if (loader) loader.classList.add('done');

  const toast = document.createElement('div');
  toast.setAttribute('role','status');
  Object.assign(toast.style,{position:'fixed',left:'50%',bottom:'2rem',translate:'-50% 20px',zIndex:'230',padding:'.9rem 1.2rem',borderRadius:'999px',background:'#f7f6f2',color:'#111',boxShadow:'0 16px 50px #0008',opacity:'0',transition:'.3s',pointerEvents:'none',whiteSpace:'nowrap'});
  document.body.appendChild(toast);
  const showToast = message => {
    toast.textContent = message;
    toast.style.opacity = '1'; toast.style.translate = '-50% 0';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.style.opacity = '0'; toast.style.translate = '-50% 20px'; }, 2200);
  };

  // Entrance, reveal and scroll progress
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  }), { threshold: .14 });
  $$('.reveal').forEach(el => revealObserver.observe(el));

  const progress = $('.scroll-progress i');
  let scrollTick = false;
  const updateProgress = () => {
    const total = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${total > 0 ? scrollY / total : 0})`;
    scrollTick = false;
  };
  addEventListener('scroll', () => {
    if (!scrollTick) requestAnimationFrame(updateProgress);
    scrollTick = true;
  }, { passive: true });
  updateProgress();

  // Custom cursor and magnetic hover
  if (matchMedia('(pointer:fine)').matches && !reduced) {
    const dot = $('.cursor-dot');
    const ring = $('.cursor-ring');
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    document.body.classList.add('cursor-ready');
    dot.style.transform = `translate(${x}px,${y}px)`;
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; dot.style.transform = `translate(${x}px,${y}px)`; }, { passive: true });
    const follow = () => {
      rx += (x - rx) * .16; ry += (y - ry) * .16;
      ring.style.transform = `translate(${rx}px,${ry}px)`;
      requestAnimationFrame(follow);
    };
    follow();
    $$('a,button,input,.jump-title,.feature-card,.style-card').forEach(el => {
      el.addEventListener('pointerenter', () => ring.classList.add('hover'));
      el.addEventListener('pointerleave', () => ring.classList.remove('hover'));
    });
    $$('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); el.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.12}px,${(e.clientY-r.top-r.height/2)*.12}px)`; });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });

  }

  // Animated chapter navigation from headings and ordinary anchors
  const wipe = $('.page-wipe');
  const goTo = selector => {
    const target = $(selector);
    if (!target) return;
    if (reduced) return target.scrollIntoView({ behavior: 'auto' });
    wipe.classList.remove('exit');
    wipe.classList.add('active');
    setTimeout(() => {
      target.scrollIntoView({ behavior: 'auto', block: 'start' });
      wipe.classList.add('exit');
      setTimeout(() => wipe.classList.remove('active', 'exit'), 460);
    }, 390);
  };
  $$('.jump-title').forEach(title => {
    const activate = () => goTo(title.dataset.next);
    title.addEventListener('click', activate);
    title.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
  });
  $$('a[href^="#"]').forEach(link => link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (href === '#') return;
    const target = $(href);
    if (!target) return;
    e.preventDefault(); goTo(href);
  }));

  // Cards and the floating chapter controller are first-class navigation controls too.
  const jumpMap = [
    ['.style-card','#journey'], ['.phase:nth-child(1)','#compare'], ['.phase:nth-child(2)','#film'],
    ['.phase:nth-child(3)','#community'], ['.model-card:first-child','#metrics'], ['.model-card.dark','#trust'],
    ['.trust-card:nth-child(1)','#download'], ['.trust-card:nth-child(2)','#download'], ['.trust-card:nth-child(3)','#download']
  ];
  jumpMap.forEach(([selector,target]) => $$(selector).forEach(el => {
    el.classList.add('module-link'); el.dataset.jump = target; el.tabIndex = 0; el.setAttribute('role','link');
  }));
  $$('[data-jump]').forEach(el => {
    const activate = event => { event?.preventDefault(); goTo(el.dataset.jump); $('.chapter-menu')?.classList.remove('open'); };
    el.addEventListener('click', activate);
    el.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') activate(event); });
  });

  // Active navigation state
  const navLinks = $$('.nav-links a');
  const navObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const href = entry.target.dataset.nav;
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === href));
  }), { rootMargin: '-25% 0px -65% 0px' });
  $$('[data-nav]').forEach(section => navObserver.observe(section));

  // Existing product interactions
  const phonePhoto = $('#phonePhoto');
  const phoneScreen = $('#phoneScreen');
  if (phonePhoto && phoneScreen) {
    $$('.chip', phoneScreen).forEach(chip => chip.addEventListener('click', () => {
      $$('.chip', phoneScreen).forEach(item => item.classList.remove('active'));
      chip.classList.add('active'); phoneScreen.dataset.look = chip.dataset.look;
      phoneScreen.classList.remove('filter-switch'); void phoneScreen.offsetWidth; phoneScreen.classList.add('filter-switch');
      showToast(`已切换「${chip.textContent.trim()}」图片效果`);
    }));
    $('#shutter')?.addEventListener('click', event => {
      event.currentTarget.classList.remove('flash'); void event.currentTarget.offsetWidth; event.currentTarget.classList.add('flash');
      phonePhoto.style.transform = 'scale(1.055)'; setTimeout(() => phonePhoto.style.transform = '', 460);
      showToast('已捕捉这一刻 · AI 自然美颜完成');
    });
  }
  const compareStage = $('#compareStage');
  const compareRange = $('#compareRange');
  if (compareStage && compareRange) compareRange.addEventListener('input', e => compareStage.style.setProperty('--split', `${e.target.value}%`));
  const styleCards = $$('.style-card');
  $$('.filter-tab').forEach((tab, index) => tab.addEventListener('click', () => {
    $$('.filter-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    tab.classList.add('active'); tab.setAttribute('aria-selected', 'true');
    styleCards[Math.min(index, styleCards.length - 1)]?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
  }));
  const countObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting || entry.target.dataset.done) return;
    entry.target.dataset.done = '1';
    const end = +entry.target.dataset.target, start = performance.now(), duration = 1450;
    const tick = now => { const p = Math.min((now-start)/duration,1); entry.target.textContent = Math.round(end*(1-Math.pow(1-p,3))); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }), { threshold: .7 });
  $$('.counter').forEach(el => countObserver.observe(el));

  // Four-step product journey
  const journeyData = [
    { meta:'STEP 01 · CAPTURE', title:'打开即拍，<br>无需等待', copy:'默认载入个人自然美颜方案，实时预览最终效果。减少选择焦虑，让用户先完成一次满意拍摄。', meter:'25%', focus:'25%' },
    { meta:'STEP 02 · STYLE MEMORY', title:'一个选择，<br>记住偏好', copy:'根据历史保留与撤销行为推荐风格，不要求用户理解复杂参数，让审美记忆真正产生效率。', meter:'50%', focus:'31%' },
    { meta:'STEP 03 · CONTROL', title:'结果自然，<br>调整可控', copy:'将肤质、轮廓、妆感拆成可理解的局部控制，任何修改都可撤销，原图始终保留。', meter:'75%', focus:'37%' },
    { meta:'STEP 04 · SHARE', title:'一次确认，<br>直接发布', copy:'自动生成主流平台画幅与清晰度，保留编辑版本，缩短拍摄到分享的最后一公里。', meter:'100%', focus:'43%' }
  ];
  const journeyStage = $('#journeyStage');
  $$('.journey-step').forEach(button => button.addEventListener('click', () => {
    const item = journeyData[+button.dataset.step];
    $$('.journey-step').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
    button.classList.add('active'); button.setAttribute('aria-selected','true');
    journeyStage.classList.add('switching');
    setTimeout(() => {
      $('#journeyMeta').textContent = item.meta;
      $('#journeyHeading').innerHTML = item.title;
      $('#journeyCopy').textContent = item.copy;
      $('#journeyMeter').style.setProperty('--meter', item.meter);
      $('.journey-focus').style.top = item.focus;
      journeyStage.classList.remove('switching');
    }, reduced ? 0 : 230);
  }));

  // Subtle perspective interaction on cards
  if (matchMedia('(pointer:fine)').matches && !reduced) {
    $$('[data-tilt]').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const ry = ((e.clientX-r.left)/r.width-.5)*8;
        const rx = -((e.clientY-r.top)/r.height-.5)*8;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
    $('.hero-visual')?.addEventListener('pointermove', e => {
      const r = e.currentTarget.getBoundingClientRect();
      const phone = $('.phone', e.currentTarget);
      phone.style.transform = `rotate(${4 + ((e.clientX-r.left)/r.width-.5)*3}deg) translateY(${((e.clientY-r.top)/r.height-.5)*-8}px)`;
    });
    $('.hero-visual')?.addEventListener('pointerleave', e => { $('.phone', e.currentTarget).style.transform = ''; });
  }

  // Canvas-based cinematic transition using the product portrait asset
  const canvas = $('#filmCanvas');
  const filmSection = $('#film');
  const filmButton = $('#filmToggle');
  if (canvas && filmSection) {
    const ctx = canvas.getContext('2d', { alpha: false });
    const image = new Image(); image.src = 'assets/glow-portrait.jpg';
    let paused = reduced, visible = false, start = performance.now(), raf = 0;
    const resize = () => { const dpr = Math.min(devicePixelRatio || 1, 2); canvas.width = Math.round(innerWidth*dpr); canvas.height = Math.round(innerHeight*dpr); ctx.setTransform(dpr,0,0,dpr,0,0); };
    resize(); addEventListener('resize', resize);
    const scheduleFilm = () => { if (!raf && visible && !paused) raf = requestAnimationFrame(draw); };
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; scheduleFilm(); }, { threshold: .05 }).observe(filmSection);
    const draw = now => {
      raf = 0;
      if (image.complete && image.naturalWidth) {
        const t = paused ? 0 : (now-start)/1000;
        const zoom = 1.08 + Math.sin(t*.22)*.035;
        const iw=image.naturalWidth, ih=image.naturalHeight, vw=innerWidth, vh=innerHeight;
        const scale=Math.max(vw/iw,vh/ih)*zoom, dw=iw*scale, dh=ih*scale;
        const x=(vw-dw)/2 + Math.sin(t*.16)*vw*.025, y=(vh-dh)/2 + Math.cos(t*.13)*vh*.018;
        ctx.fillStyle='#071018'; ctx.fillRect(0,0,vw,vh); ctx.filter=`saturate(${1.02+Math.sin(t*.3)*.05}) contrast(1.05)`; ctx.drawImage(image,x,y,dw,dh); ctx.filter='none';
        ctx.fillStyle='rgba(8,10,12,.14)'; for(let sy=0;sy<vh;sy+=5) ctx.fillRect(0,sy,vw,1);
      }
      scheduleFilm();
    };
    image.addEventListener('load', scheduleFilm);
    filmButton?.addEventListener('click', () => { paused=!paused; filmButton.textContent=paused?'播放动态影像':'暂停动态影像'; filmButton.setAttribute('aria-pressed', String(paused)); if(!paused){start=performance.now();scheduleFilm();} });
  }

  // Persistent controller: light, motion, chapter menu and top jump.
  const chapterButton = $('[data-control="chapters"]');
  const chapterMenu = $('#chapterMenu');
  chapterButton?.addEventListener('click', () => {
    const open = !chapterMenu.classList.contains('open');
    chapterMenu.classList.toggle('open', open); chapterButton.setAttribute('aria-expanded', String(open));
  });
  $('[data-control="motion"]')?.addEventListener('click', event => {
    const paused = document.body.classList.toggle('motion-paused');
    event.currentTarget.setAttribute('aria-pressed', String(!paused));
    $('span', event.currentTarget).textContent = paused ? '▶' : 'Ⅱ';
    if (filmButton && filmButton.getAttribute('aria-pressed') !== String(paused)) filmButton.click();
    showToast(paused ? '页面动态已暂停' : '页面动态已继续');
  });
  $('[data-control="top"]')?.addEventListener('click', () => goTo('#top'));
  document.addEventListener('click', event => {
    if (!event.target.closest('.motion-dock')) { chapterMenu?.classList.remove('open'); chapterButton?.setAttribute('aria-expanded','false'); }
  });

  // Prototype download buttons give explicit feedback instead of dead links.
  $$('.store').forEach(link => link.addEventListener('click', e => { e.preventDefault(); showToast('产品演示版：下载渠道将在发布阶段接入'); }));
})();
