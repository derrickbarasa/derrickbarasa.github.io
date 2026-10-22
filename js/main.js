// Make sure every image loads: retry a failed one a few times with a cache-buster
function retryImage(img, attempt) {
    attempt = attempt || 0;
    if (attempt >= 3) return;
    const base = img.getAttribute('src').split('?')[0];
    setTimeout(() => {
        img.onerror = () => retryImage(img, attempt + 1);
        img.src = base + '?r=' + (attempt + 1);
    }, 800 * (attempt + 1));
}
document.querySelectorAll('img[src^="img/"]').forEach(img => {
    img.addEventListener('error', () => retryImage(img, 0), { once: true });
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) retryImage(img, 0);
});
window.addEventListener('pageshow', () => {
    document.querySelectorAll('img[src^="img/"]').forEach(img => {
        if (img.complete && img.naturalWidth === 0) retryImage(img, 0);
    });
});


// Mobile menu
const menuBtn = document.getElementById('menu-btn');
const menu = document.getElementById('mobile-menu');
function setMenu(open) {
    menu.classList.toggle('hidden', !open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.innerHTML = '<svg class="ic text-xl" aria-hidden="true"><use href="#fa-' + (open ? 'xmark' : 'bars') + '"/></svg>';
}
menuBtn.addEventListener('click', () => setMenu(menu.classList.contains('hidden')));
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

// Contact form -> Web3Forms (delivers straight to the inbox)
const cForm = document.getElementById('contact-form');
const cBtn = document.getElementById('cf-submit');
const cLabel = document.getElementById('cf-label');
const cStatus = document.getElementById('cf-status');
function cSay(text, kind) {
    cStatus.textContent = text;
    cStatus.className = 'text-sm text-center min-h-[1.25rem] ' + (kind === 'ok' ? 'text-emerald-500' : kind === 'err' ? 'text-red-500' : 'text-slate-500');
}
// Show the timeline/budget box only for project enquiries
const cTopic = document.getElementById('cf-topic');
const cDetailWrap = document.getElementById('cf-detail-wrap');
cTopic.addEventListener('change', () => cDetailWrap.classList.toggle('hidden', cTopic.value !== 'Contract or project'));
cForm.addEventListener('reset', () => cDetailWrap.classList.add('hidden'));
cForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (!cForm.checkValidity()) { cForm.reportValidity(); return; }
    if (document.getElementById('cf-botcheck').checked) return; // spam trap
    const name = document.getElementById('cf-name').value.trim();
    const email = document.getElementById('cf-email').value.trim();
    const message = document.getElementById('cf-msg').value.trim();
    const topic = document.getElementById('cf-topic').value;
    const detail = document.getElementById('cf-detail').value.trim();
    cBtn.disabled = true; cLabel.textContent = 'Sending...'; cSay('', '');
    try {
        const res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                access_key: 'e2f69901-19bc-450e-a31b-b392a9592f99',
                subject: 'Portfolio: ' + topic + ' from ' + name,
                from_name: 'Portfolio website',
                name, email, topic, timeline_or_budget: detail, message, botcheck: document.getElementById('cf-botcheck').checked
            })
        });
        const data = await res.json();
        if (res.ok && data.success) {
            cForm.reset();
            cSay('Thank you! Your message was sent. I will get back to you soon.', 'ok');
        } else {
            throw new Error(data.message || 'Request failed');
        }
    } catch (err) {
        cSay('Sorry, that did not go through. Please try again, or message me on WhatsApp.', 'err');
    } finally {
        cBtn.disabled = false; cLabel.textContent = 'Send Message';
    }
});

// Active nav link (skipped if IntersectionObserver is unavailable)
if ('IntersectionObserver' in window) {
    // Active nav link
    const links = document.querySelectorAll('nav .nav-link');
    const spy = new IntersectionObserver(entries => entries.forEach(en => {
        if (en.isIntersecting) links.forEach(l =>
            l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id));
    }), { rootMargin: '-40% 0px -55% 0px' });
    document.querySelectorAll('section[id]').forEach(sec => spy.observe(sec));
}

const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.getElementById('year').textContent = new Date().getFullYear();

// Case study tabs: click or arrow keys to switch
(function () {
    const tabs = Array.from(document.querySelectorAll('.cs-tab[role="tab"]'));
    const bar = document.getElementById('cs-controls');
    const panels = document.getElementById('cs-panels');
    if (!tabs.length || !bar || !panels) return;
    bar.classList.remove('hidden'); bar.classList.add('flex');
    panels.classList.add('cs-stack');
    function show(i) {
        tabs.forEach((t, k) => {
            const on = k === i;
            t.setAttribute('aria-selected', on);
            t.tabIndex = on ? 0 : -1;
            const panel = document.getElementById(t.getAttribute('aria-controls'));
            panel.classList.remove('mt-10', 'pt-10', 'border-t');
            panel.classList.toggle('cs-off', !on);
            panel.setAttribute('aria-hidden', !on);
        });
    }
    tabs.forEach((t, k) => {
        t.addEventListener('click', () => show(k));
        t.addEventListener('keydown', e => {
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
            const n = (k + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
            tabs[n].focus(); show(n);
        });
    });
    show(0);
})();

// Analytics consent: banner for European time zones, plus a privacy panel in the footer that anyone can use
(function () {
    const box = document.getElementById('consent');
    const state = document.getElementById('privacy-state');
    let saved = null, zone = '';
    try { saved = localStorage.getItem('analytics-consent'); } catch (e) {}
    try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    const europe = /^(Europe|Atlantic\/(Reykjavik|Faroe|Madeira|Canary))/.test(zone);
    function label() {
        if (saved === 'denied') return 'off';
        if (saved === 'granted') return 'on';
        return europe ? 'off until you accept' : 'on';
    }
    function choose(value) {
        saved = value;
        try { localStorage.setItem('analytics-consent', value); } catch (e) {}
        gtag('consent', 'update', { analytics_storage: value });
        if (box) box.classList.add('hidden');
        if (state) state.textContent = label();
    }
    if (state) state.textContent = label();
    if (box && !saved && europe) box.classList.remove('hidden');
    const on = (id, v) => { const el = document.getElementById(id); if (el) el.addEventListener('click', () => choose(v)); };
    on('consent-accept', 'granted'); on('consent-decline', 'denied');
    on('privacy-on', 'granted'); on('privacy-off', 'denied');
})();

// Demo videos: play only while visible, never for reduced motion, and always pausable
(function () {
    const vids = document.querySelectorAll('.demo-video');
    if (!vids.length) return;
    // Posters are attached just before a video scrolls into view, so they cost nothing at load
    if ('IntersectionObserver' in window) {
        const posters = new IntersectionObserver((en, obs) => en.forEach(x => {
            if (x.isIntersecting) { x.target.poster = x.target.dataset.poster; obs.unobserve(x.target); }
        }), { rootMargin: '400px' });
        vids.forEach(v => posters.observe(v));
    } else { vids.forEach(v => { v.poster = v.dataset.poster; }); }
    vids.forEach(v => {
        const btn = v.nextElementSibling && v.nextElementSibling.classList.contains('demo-toggle') ? v.nextElementSibling : null;
        let userPaused = false;
        function setBtn() { if (!btn) return; btn.setAttribute('aria-pressed', v.paused); btn.setAttribute('aria-label', v.paused ? 'Play demo video' : 'Pause demo video'); }
        if (btn) btn.addEventListener('click', () => {
            if (v.paused) { userPaused = false; v.play().catch(() => {}); } else { userPaused = true; v.pause(); }
            setBtn();
        });
        v.addEventListener('play', setBtn); v.addEventListener('pause', setBtn);
        if (calm || !('IntersectionObserver' in window)) { setBtn(); return; }
        new IntersectionObserver(en => {
            if (userPaused) return;
            if (en[0].isIntersecting) v.play().catch(() => {}); else v.pause();
        }, { threshold: 0.5 }).observe(v);
    });
})();

// Technical note dialogs
(function () {
    const buttons = document.querySelectorAll('[data-dialog]');
    if (!buttons.length || typeof HTMLDialogElement === 'undefined') return;
    buttons.forEach(btn => btn.addEventListener('click', () => {
        const dlg = document.getElementById(btn.dataset.dialog);
        if (!dlg) return;
        dlg._opener = btn;
        dlg.showModal();
    }));
    document.querySelectorAll('dialog.notes-dialog').forEach(dlg => {
        dlg.querySelector('.notes-close').addEventListener('click', () => dlg.close());
        dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
        dlg.addEventListener('close', () => { if (dlg._opener) dlg._opener.focus(); });
    });
})();

// Hero recordings: one video, three systems. Advances when a clip ends, never autoplays under reduced motion, always pausable
(function () {
    const v = document.getElementById('hero-video');
    const tabs = Array.from(document.querySelectorAll('.hero-tab'));
    const toggle = document.getElementById('hero-toggle');
    if (!v || !tabs.length || !toggle) return;
    const title = document.getElementById('hero-title'), note = document.getElementById('hero-note');
    const link = document.getElementById('hero-link'), priv = document.getElementById('hero-private');
    let current = 0, userPaused = false;
    function setToggle() {
        toggle.textContent = v.paused ? 'Play' : 'Pause';
        toggle.setAttribute('aria-pressed', v.paused);
        toggle.setAttribute('aria-label', v.paused ? 'Play the recordings' : 'Pause the recordings');
    }
    function show(i, play) {
        current = i;
        tabs.forEach((t, k) => { t.setAttribute('aria-selected', k === i); t.tabIndex = k === i ? 0 : -1; });
        const t = tabs[i];
        v.poster = t.dataset.poster;
        v.src = t.dataset.src;
        title.textContent = t.dataset.title;
        note.textContent = t.dataset.note;
        link.hidden = !t.dataset.href; priv.hidden = !!t.dataset.href;
        if (t.dataset.href) link.href = t.dataset.href;
        if (play && !calm) v.play().catch(() => {}); else setToggle();
    }
    tabs.forEach((t, k) => {
        t.addEventListener('click', () => { userPaused = false; show(k, true); });
        t.addEventListener('keydown', e => {
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
            const n = (k + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
            tabs[n].focus(); userPaused = false; show(n, true);
        });
    });
    v.addEventListener('ended', () => show((current + 1) % tabs.length, !userPaused));
    v.addEventListener('play', setToggle); v.addEventListener('pause', setToggle);
    toggle.addEventListener('click', () => {
        if (v.paused) { userPaused = false; v.play().catch(() => {}); } else { userPaused = true; v.pause(); }
    });
    if (calm) { v.autoplay = false; v.pause(); }
    setToggle();
    if ('IntersectionObserver' in window && !calm) {
        new IntersectionObserver(en => {
            if (userPaused) return;
            if (en[0].isIntersecting) v.play().catch(() => {}); else v.pause();
        }, { threshold: 0.3 }).observe(v);
    }
})();

// Services and case studies: collapsed on phones, everything open on larger screens
(function () {
    const items = document.querySelectorAll('details.svc, details.cs-wrap');
    if (!items.length || !window.matchMedia) return;
    const mq = window.matchMedia('(max-width: 640px)');
    const apply = () => items.forEach(d => { d.open = !mq.matches; });
    apply();
    if (mq.addEventListener) mq.addEventListener('change', apply);
})();

// Project cards on phones: three-line description, details behind a More button
(function () {
    const cards = Array.from(document.querySelectorAll('#projects .grid > div')).filter(d => d.querySelector('h4'));
    if (!cards.length || !window.matchMedia) return;
    const mq = window.matchMedia('(max-width: 640px)');
    const parts = cards.map(card => {
        const top = card.firstElementChild;
        const head = card.querySelector('h4').parentElement;
        const desc = head.nextElementSibling;
        if (!top || !desc || desc.tagName !== 'P') return null;
        desc.classList.add('card-desc');
        const extras = Array.from(top.children).filter(el => el !== desc && (el.tagName === 'UL' || (el.tagName === 'P' && el.classList.contains('font-mono'))));
        extras.forEach(el => el.classList.add('card-extra'));
        const btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'card-more'; btn.textContent = 'More';
        btn.setAttribute('aria-expanded', 'false');
        desc.after(btn);
        btn.addEventListener('click', () => {
            const open = card.classList.toggle('card-open');
            btn.textContent = open ? 'Less' : 'More';
            btn.setAttribute('aria-expanded', open);
        });
        return card;
    }).filter(Boolean);
    const apply = () => parts.forEach(card => card.classList.toggle('card-trim', mq.matches));
    apply();
    if (mq.addEventListener) mq.addEventListener('change', apply);
})();
