(() => {
  'use strict';

  const CONFIG = {
    name: 'Laura', 
    question: 'Willst du mit mir zusammen sein?',
    yesLabel: 'Ja',
    noLabel: 'Nein',

    hints: [
      'Hm, bist du dir sicher? 🥺',
      'Überleg es dir nochmal …',
      'Der Nein-Knopf wird schon ganz klein 😢',
      'Ich glaube, er will eigentlich auch Ja sagen 💕',
      'Letzte Chance für Nein …',
      'Tja – jetzt bleibt nur noch Ja 😏'
    ],

    dodgeHint: 'Der Nein-Knopf ist wohl ziemlich schüchtern 🙈',

    answerTitle: 'Jaaaaaaaaaaaaa🥰',
    answerText: 'Du hast mich gerade ziemlich glücklich gemacht! 💖🥰'
  };

  const $ = (id) => document.getElementById(id);
  const title = $('title');
  const hint = $('hint');
  const yes = $('yes');
  const no = $('no');
  const slot = $('noSlot');
  const questionScreen = $('question');
  const answerScreen = $('answer');
  const heartsBox = $('hearts');
  const root = document.documentElement;

  const MAX_NO = CONFIG.hints.length;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (min, max) => min + Math.random() * (max - min);

  let noCount = 0;      // Wie oft wurde „Nein“ angetippt?
  let dodgeCount = 0;   // Wie oft ist der Knopf am PC ausgewichen?
  let dodging = false;  // Ist der Knopf schon „frei schwebend“?
  let answered = false;


  title.textContent = CONFIG.name
    ? `${CONFIG.name}, ${CONFIG.question.charAt(0).toLowerCase()}${CONFIG.question.slice(1)}`
    : CONFIG.question;
  yes.textContent = CONFIG.yesLabel;
  no.textContent = CONFIG.noLabel;
  $('answerTitle').textContent = CONFIG.answerTitle;
  $('answerText').textContent = CONFIG.answerText;


  function startDodging() {
    const r = no.getBoundingClientRect();
    slot.style.width = r.width + 'px';
    slot.style.height = r.height + 'px';
    no.classList.add('dodging');
    no.style.left = r.left + 'px';
    no.style.top = r.top + 'px';
    void no.offsetWidth;
    dodging = true;
  }

  function overlaps(x, y, w, h, rect, pad) {
    return x < rect.right + pad && x + w > rect.left - pad &&
           y < rect.bottom + pad && y + h > rect.top - pad;
  }

  function dodge(px, py) {
    if (!dodging) startDodging();

    const w = no.offsetWidth;
    const h = no.offsetHeight;
    const m = 12;
    const maxX = Math.max(m, window.innerWidth - w - m);
    const maxY = Math.max(m, window.innerHeight - h - m);
    const yesRect = yes.getBoundingClientRect();

    let x = m;
    let y = m;
    for (let i = 0; i < 40; i++) {
      x = rand(m, maxX);
      y = rand(m, maxY);
      const farFromPointer = Math.hypot(x + w / 2 - px, y + h / 2 - py) > 220;
      if (farFromPointer && !overlaps(x, y, w, h, yesRect, 16)) break;
    }
    no.style.left = x + 'px';
    no.style.top = y + 'px';

    dodgeCount++;
    if (dodgeCount === 3 && noCount === 0) hint.textContent = CONFIG.dodgeHint;
  }

  document.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || answered || no.classList.contains('gone')) return;
    const r = no.getBoundingClientRect();
    const dist = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
    if (dist < Math.max(r.width, r.height) / 2 + 80) dodge(e.clientX, e.clientY);
  });

  window.addEventListener('resize', () => {
    if (!dodging) return;
    const r = no.getBoundingClientRect();
    no.style.left = Math.max(12, Math.min(r.left, window.innerWidth - r.width - 12)) + 'px';
    no.style.top = Math.max(12, Math.min(r.top, window.innerHeight - r.height - 12)) + 'px';
  });

  function applySizes() {
    root.style.setProperty('--yes-size', (1.3 + noCount * 0.55) + 'rem');
    root.style.setProperty('--no-size', (1.1 * Math.pow(0.7, noCount)) + 'rem');
  }

  no.addEventListener('click', () => {
    if (answered) return;
    noCount++;
    hint.textContent = CONFIG.hints[Math.min(noCount, MAX_NO) - 1];

    if (noCount >= MAX_NO) {
      no.classList.add('gone');
      slot.classList.add('gone');
      root.style.setProperty('--yes-size', (1.3 + MAX_NO * 0.55) + 'rem');
    } else {
      applySizes();
    }
  });


  const SYMBOLS = ['💗', '💖', '💕', '💓', '🌸'];

  function spawnHeart(burst) {
    const h = document.createElement('span');
    h.className = 'heart';
    h.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    h.style.left = rand(0, 96) + 'vw';
    h.style.fontSize = (burst ? rand(1.4, 2.8) : rand(1, 2.2)) + 'rem';
    h.style.setProperty('--o', burst ? 0.9 : 0.45);
    h.style.animationDuration = (burst ? rand(3, 6) : rand(9, 15)) + 's';
    if (burst) h.style.animationDelay = rand(0, 1.2) + 's';
    h.addEventListener('animationend', () => h.remove());
    heartsBox.appendChild(h);
  }

  if (!reduceMotion) {
    setInterval(() => spawnHeart(false), 1200);
  }

  yes.addEventListener('click', () => {
    answered = true;
    questionScreen.hidden = true;
    answerScreen.hidden = false;
    document.title = 'Ja! 💖';
    if (!reduceMotion) {
      for (let i = 0; i < 60; i++) spawnHeart(true);
    }
  });
})();
