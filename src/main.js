import './style.css'
import fotoUrl from './assets/foto.jpeg'

const pages = {
  home: { title: 'Untuk Sarah', url: '/pages/home.html' },
  surat: { title: 'Sebuah surat kecil', url: '/pages/surat.html' },
  maaf: { title: 'Dari hati, maafku', url: '/pages/maaf.html' },
}

const app = document.querySelector('#app')

app.innerHTML = `
  <header class="site-header">
    <a class="brand" href="#/home" aria-label="Beranda — Untuk Sarah">
      <span class="brand-mark" aria-hidden="true">s.</span>
      <span>sebuah hari untuk Sarah</span>
    </a>
    <nav class="site-nav" aria-label="Navigasi utama">
      <a href="#/home" data-route="home">Beranda</a>
      <a href="#/surat" data-route="surat">Surat kecil</a>
      <a href="#/maaf" data-route="maaf">Dari hati</a>
    </nav>
  </header>

  <main class="page-frame-wrap">
    <iframe class="page-frame" title="Ucapan ulang tahun untuk Sarah"></iframe>
  </main>

  <footer class="music-bar">
    <div class="music-copy">
      <span class="music-note" aria-hidden="true">♫</span>
      <span>
        <strong>Selamat Ulang Tahun</strong>
        <span class="music-artist">Jamrud · lagu untuk Sarah</span>
      </span>
    </div>
    <div class="music-controls">
      <span class="music-status" role="status" aria-live="polite">Memeriksa lagu…</span>
      <label class="music-file" hidden>
        Pilih lagu
        <input class="music-input" type="file" accept="audio/*" aria-label="Pilih file lagu ulang tahun" />
      </label>
      <button class="music-toggle" type="button" aria-label="Putar lagu" disabled>
        <span aria-hidden="true">▶</span>
      </button>
    </div>
    <audio class="birthday-audio" src="/audio/jamrud-selamat-ulang-tahun.mp3" preload="metadata" loop></audio>
  </footer>
`

const frame = app.querySelector('.page-frame')
const audio = app.querySelector('.birthday-audio')
const musicToggle = app.querySelector('.music-toggle')
const musicStatus = app.querySelector('.music-status')
const musicFile = app.querySelector('.music-file')
const musicInput = app.querySelector('.music-input')
const navLinks = [...app.querySelectorAll('[data-route]')]
let audioAvailable = false
let selectedAudioUrl = null

function renderPage() {
  const route = window.location.hash.replace(/^#\/?/, '') || 'home'
  const page = pages[route] || pages.home

  navLinks.forEach((link) => {
    const isCurrent = link.dataset.route === (pages[route] ? route : 'home')
    link.classList.toggle('is-active', isCurrent)
    if (isCurrent) link.setAttribute('aria-current', 'page')
    else link.removeAttribute('aria-current')
  })

  if (frame.dataset.route !== route) {
    frame.dataset.route = route
    frame.src = page.url
  }
}

function updateFrameHeight() {
  const content = frame.contentDocument?.documentElement
  if (content) frame.style.height = `${content.scrollHeight}px`
}

function updateMusicStatus(message) {
  musicStatus.textContent = message
}

frame.addEventListener('load', () => {
  const photo = frame.contentDocument?.querySelector('[data-photo]')
  if (photo) photo.src = fotoUrl

  updateFrameHeight()
})

audio.addEventListener('canplay', () => {
  audioAvailable = true
  musicToggle.disabled = false
  musicFile.hidden = true
  updateMusicStatus(audio.paused ? 'Klik untuk memutar' : 'Sedang diputar')
})

audio.addEventListener('play', () => {
  musicToggle.setAttribute('aria-label', 'Jeda lagu')
  musicToggle.innerHTML = '<span aria-hidden="true">Ⅱ</span>'
  updateMusicStatus('Sedang diputar')
})

audio.addEventListener('pause', () => {
  musicToggle.setAttribute('aria-label', 'Putar lagu')
  musicToggle.innerHTML = '<span aria-hidden="true">▶</span>'
  if (audioAvailable) updateMusicStatus('Lagu dijeda')
})

audio.addEventListener('error', () => {
  audioAvailable = false
  musicToggle.disabled = true
  musicFile.hidden = false
  updateMusicStatus('Lagu belum tersedia')
})

musicInput.addEventListener('change', () => {
  const file = musicInput.files?.[0]
  if (!file) return

  if (selectedAudioUrl) URL.revokeObjectURL(selectedAudioUrl)
  selectedAudioUrl = URL.createObjectURL(file)
  audio.src = selectedAudioUrl
  audio.load()
  updateMusicStatus('Memuat lagu…')
  audio.play().catch(() => {
    if (audioAvailable) updateMusicStatus('Klik untuk memutar')
  })
})

musicToggle.addEventListener('click', async () => {
  if (audio.paused) {
    try {
      await audio.play()
    } catch (error) {
      updateMusicStatus('Lagu tidak dapat diputar. Periksa file audio.')
      console.error('Gagal memutar lagu ulang tahun:', error)
    }
  } else {
    audio.pause()
  }
})

window.addEventListener('hashchange', renderPage)
window.addEventListener('resize', updateFrameHeight)
renderPage()

audio.play().catch(() => {
  if (audioAvailable) updateMusicStatus('Klik untuk memutar')
})
