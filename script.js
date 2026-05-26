// ═══════════════════════════════════════════════════
//   ✿  script untuk undangan kak hasya  ✿
// ═══════════════════════════════════════════════════

const scenes  = [...document.querySelectorAll('.scene')];
let   current = 0;

function showScene(idx) {
  scenes.forEach((s, i) => s.classList.toggle('is-active', i === idx));
  current = idx;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function next() { if (current < scenes.length - 1) showScene(current + 1); }

// ───── envelope click → next scene ─────
const envelope = document.getElementById('envelope');
envelope.addEventListener('click', () => {
  envelope.classList.add('is-open');
  setTimeout(next, 900);
});

// ───── generic [data-next] buttons ─────
document.querySelectorAll('[data-next]').forEach(btn => {
  btn.addEventListener('click', next);
});

// ═══════════════════════════════════════════════════
//   QUIZ
// ═══════════════════════════════════════════════════
const QUIZ = [
  {
    q: 'kucing tidur rata-rata berapa jam sehari?',
    options: ['4–6 jam', '12–16 jam', '18–22 jam'],
    answer: 1,
    hint: 'mereka beneran pro tidur ✿'
  },
  {
    q: 'pisang itu termasuk... ?',
    options: ['Buah', 'Sayur', 'Beri (berry)'],
    answer: 2,
    hint: 'secara botani, pisang itu beri loh!'
  },
  {
    q: 'apa warna asli flamingo waktu baru lahir?',
    options: ['Pink', 'Abu-abu / putih', 'Oranye'],
    answer: 1,
    hint: 'pink-nya dari makanan, bukan bawaan ✦'
  }
];

let qIndex = 0;
let score  = 0;
const qNum      = document.getElementById('qNum');
const qText     = document.getElementById('qText');
const qChoices  = document.getElementById('qChoices');
const qFeedback = document.getElementById('qFeedback');
const dots      = document.querySelectorAll('.dot');

function loadQuestion() {
  const item = QUIZ[qIndex];
  qNum.textContent  = qIndex + 1;
  qText.textContent = item.q;
  qChoices.innerHTML = '';
  qFeedback.textContent = '';

  // update progress dots
  dots.forEach((d, i) => {
    d.classList.remove('is-current', 'is-done');
    if (i < qIndex)  d.classList.add('is-done');
    if (i === qIndex) d.classList.add('is-current');
  });

  item.options.forEach((opt, i) => {
    const b = document.createElement('button');
    b.className = 'choice';
    b.textContent = opt;
    b.addEventListener('click', () => handleAnswer(b, i, item));
    qChoices.appendChild(b);
  });
}

function handleAnswer(btn, i, item) {
  const buttons = [...qChoices.querySelectorAll('.choice')];
  buttons.forEach(b => b.disabled = true);

  if (i === item.answer) {
    btn.classList.add('is-correct');
    qFeedback.textContent = 'yeyy bener! ' + item.hint;
    score++;
  } else {
    btn.classList.add('is-wrong');
    buttons[item.answer].classList.add('is-correct');
    qFeedback.textContent = 'hampirr! ' + item.hint;
  }

  setTimeout(() => {
    qIndex++;
    if (qIndex < QUIZ.length) {
      loadQuestion();
    } else {
      // finish quiz
      dots.forEach(d => { d.classList.remove('is-current'); d.classList.add('is-done'); });
      document.getElementById('quizScore').value = score;
      setTimeout(() => { next(); launchConfetti(); }, 600);
    }
  }, 1500);
}

// observe when quiz scene becomes active, load Q1
const observer = new MutationObserver(() => {
  const quizScene = document.querySelector('.scene--quiz');
  if (quizScene.classList.contains('is-active') && qIndex === 0 && !qText.textContent.includes('?')) {
    loadQuestion();
  }
});
scenes.forEach(s => observer.observe(s, { attributes: true, attributeFilter: ['class'] }));

// ═══════════════════════════════════════════════════
//   CONFETTI
// ═══════════════════════════════════════════════════
function launchConfetti() {
  const containers = document.querySelectorAll('.confetti');
  const colors = ['#e85d75', '#ffd5c2', '#e0d4ff', '#cfe7ff', '#ffb3c1'];
  containers.forEach(c => {
    c.innerHTML = '';
    for (let i = 0; i < 40; i++) {
      const s = document.createElement('span');
      s.style.left  = Math.random() * 100 + '%';
      s.style.background = colors[Math.floor(Math.random() * colors.length)];
      s.style.animationDelay    = (Math.random() * 1.5) + 's';
      s.style.animationDuration = (2.2 + Math.random() * 1.5) + 's';
      s.style.transform = `rotate(${Math.random() * 360}deg)`;
      s.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      c.appendChild(s);
    }
  });
}

// ═══════════════════════════════════════════════════
//   FORM SUBMIT
// ═══════════════════════════════════════════════════
const form = document.getElementById('rsvpForm');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const action = form.getAttribute('action');

  // if Formspree ID belum di-set, langsung lanjut ke thanks (demo mode)
  if (action.includes('REPLACE_WITH_YOUR_FORMSPREE_ID')) {
    console.warn('Formspree ID belum di-set, demo mode aja.');
    next();
    launchConfetti();
    return;
  }

  try {
    const res = await fetch(action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      next();
      launchConfetti();
    } else {
      alert('Yah, gagal ngirim. Coba lagi ya 🥲');
    }
  } catch (err) {
    alert('Gagal terkirim. Cek koneksi ya 🥲');
  }
});
