/*
  VOTAÇÃO DO MASCOTE – EBM DONÍCIA MARIA DA COSTA
  Para cadastrar mascotes: edite a lista CANDIDATES abaixo.
  Coloque as imagens na pasta "imagens" e informe o caminho no campo image.
*/
const CANDIDATES = [
  { number: "01", name: "Mascote 01", image: "01_mascote.jpeg", description: "Imagem do primeiro mascote participante." },
  { number: "02", name: "Mascote 02", image: "02_mascote.jpeg", description: "Imagem do segundo mascote participante." },
  { number: "03", name: "Mascote 03", image: "03_mascote.jpeg", description: "Imagem do terceiro mascote participante." },
  { number: "04", name: "Mascote 04", image: "04_mascote.jpeg", description: "Imagem do quarto mascote participante." },
  { number: "05", name: "Mascote 05", image: "05_mascote.jpeg", description: "Imagem do quinto mascote participante." },
  { number: "06", name: "Mascote 06", image: "06_mascote.jpeg", description: "Imagem do sexto mascote participante." },
  { number: "07", name: "Mascote 07", image: "07_mascote.jpeg", description: "Imagem do setimo mascote participante." },
  { number: "08", name: "Mascote 08", image: "08_mascote.jpeg", description: "Imagem do oitavo mascote participante." },
  { number: "09", name: "Mascote 09", image: "09_mascote.jpeg", description: "Imagem do novo mascote participante." },
  { number: "10", name: "Mascote 10", image: "10_mascote.jpeg", description: "Imagem do decimo mascote participante." },
  { number: "11", name: "Mascote 11", image: "11_mascote.jpeg", description: "Imagem do decimo primeiro mascote participante." },
  { number: "12", name: "Mascote 12", image: "12_mascote.jpeg", description: "Imagem do decimo segundo participante." },
  { number: "13", name: "Mascote 13", image: "13_mascote.jpeg", description: "Imagem do decimo terceiro participante." },
  { number: "14", name: "Mascote 14", image: "14_mascote.jpeg", description: "Imagem do decimo quarto participante." },
  { number: "15", name: "Mascote 15", image: "15_mascote.jpeg", description: "Imagem do decimo quinto participante." }
];

const ADMIN_PIN = "1739"; // Altere esta senha antes de utilizar a urna.
const VOTES_KEY = "ebm_mascote_votes_v1";
const POLL_KEY = "ebm_mascote_poll_open_v1";

let typed = "";
let selected = null;
let adminUnlocked = false;

const $ = id => document.getElementById(id);
const typedEl = $("typed");
const messageEl = $("message");
const preview = $("candidatePreview");
const candidateTitle = $("candidateTitle");
const candidateImage = $("candidateImage");
const candidateDescription = $("candidateDescription");

function getVotes() {
  try { return JSON.parse(localStorage.getItem(VOTES_KEY)) || []; }
  catch { return []; }
}
function setVotes(votes) { localStorage.setItem(VOTES_KEY, JSON.stringify(votes)); }
function isPollOpen() { return localStorage.getItem(POLL_KEY) !== "false"; }

function updateDisplay() {
  typedEl.textContent = typed.padEnd(2, "_");
  selected = CANDIDATES.find(c => c.number === typed) || null;
  if (selected) {
    preview.classList.remove("hidden");
    candidateTitle.textContent = selected.number + " — " + selected.name;
    candidateImage.onerror = () => {
      candidateImage.onerror = null;
      candidateImage.src = makePlaceholder(selected.number);
    };
    candidateImage.src = selected.image;
    candidateDescription.textContent = selected.description;
    messageEl.textContent = "Confira o mascote. Se estiver correto, pressione CONFIRMA.";
  } else {
    preview.classList.add("hidden");
    messageEl.textContent = typed.length === 0
      ? "Digite o número do mascote para visualizar a imagem."
      : "Número digitado: " + typed + ". Complete ou corrija.";
  }
}
function makePlaceholder(number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380"><rect width="100%" height="100%" fill="#e8eef6"/><text x="50%" y="45%" text-anchor="middle" font-family="Arial" font-size="34" fill="#123f78">INSIRA A IMAGEM</text><text x="50%" y="62%" text-anchor="middle" font-family="Arial" font-size="54" font-weight="bold" fill="#123f78">${number}</text></svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}
function keyPress(k) {
  if (!isPollOpen()) return;
  if (typed === "BR" || typed.length >= 2) typed = "";
  typed += k;
  updateDisplay();
}
function resetScreen() {
  typed = "";
  selected = null;
  updateDisplay();
}
function playConfirmationSound() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine"; osc.frequency.value = 880;
    gain.gain.value = 0.07;
    osc.start(); osc.stop(ctx.currentTime + 0.18);
  } catch (e) {}
}
function finishVote(text) {
  messageEl.textContent = text;
  playConfirmationSound();
  setTimeout(resetScreen, 1600);
}
document.querySelectorAll("[data-key]").forEach(b => b.addEventListener("click", () => keyPress(b.dataset.key)));
$("clear").addEventListener("click", resetScreen);
$("cancel").addEventListener("click", resetScreen);
$("blank").addEventListener("click", () => {
  if (!isPollOpen()) return;
  typed = "BR"; selected = null;
  preview.classList.add("hidden");
  typedEl.textContent = "BR";
  messageEl.textContent = "Voto em branco selecionado. Pressione CONFIRMA.";
});
$("confirm").addEventListener("click", () => {
  if (!isPollOpen()) { messageEl.textContent = "A votação está encerrada."; return; }
  if (typed === "BR") {
    const votes = getVotes();
    votes.push({ number: "BR", name: "Voto em branco", time: new Date().toISOString() });
    setVotes(votes); finishVote("VOTO EM BRANCO CONFIRMADO. Obrigado por participar!"); return;
  }
  if (!selected) { messageEl.textContent = "Digite um número válido antes de confirmar."; return; }
  if (!window.confirm("Confirmar voto em " + selected.number + " — " + selected.name + "?")) return;
  const votes = getVotes();
  votes.push({ number: selected.number, name: selected.name, time: new Date().toISOString() });
  setVotes(votes);
  finishVote("VOTO CONFIRMADO. Obrigado por participar!");
});

function renderCandidates() {
  const grid = $("candidateGrid");
  grid.innerHTML = "";
  CANDIDATES.forEach(c => {
    const card = document.createElement("article");
    card.className = "candidate-card";
    const num = document.createElement("div"); num.className = "number"; num.textContent = c.number;
    const img = document.createElement("img"); img.alt = c.name; img.src = c.image;
    img.onerror = () => { img.onerror = null; img.src = makePlaceholder(c.number); };
    const name = document.createElement("h3"); name.textContent = c.name;
    card.append(num, img, name); grid.appendChild(card);
  });
}
function updatePollStatus() {
  const open = isPollOpen();
  $("closedNotice").classList.toggle("hidden", open);
  document.querySelectorAll(".keypad button, .actions button").forEach(b => b.disabled = !open);
  if (!open) {
    resetScreen();
    messageEl.textContent = "A votação está encerrada. Procure a organização da escola.";
  }
}
function showResults() {
  const votes = getVotes();
  const total = votes.length;
  const counts = {};
  CANDIDATES.forEach(c => counts[c.number] = 0);
  counts.BR = 0;
  votes.forEach(v => counts[v.number] = (counts[v.number] || 0) + 1);
  let html = `<h3>Resultado da votação</h3><p><strong>Total de votos registrados:</strong> ${total}</p>`;
  html += `<table><thead><tr><th>Número</th><th>Mascote / opção</th><th>Votos</th><th>Percentual</th></tr></thead><tbody>`;
  [...CANDIDATES, {number:"BR", name:"Voto em branco"}].forEach(c => {
    const n = counts[c.number] || 0;
    const pct = total ? ((n / total) * 100).toFixed(1) : "0.0";
    html += `<tr><td>${c.number}</td><td>${c.name}</td><td>${n}</td><td>${pct}%</td></tr>`;
  });
  html += `</tbody></table><p class="small muted">Relatório gerado em ${new Date().toLocaleString("pt-BR")}.</p>`;
  $("results").innerHTML = html;
}
$("unlockAdmin").addEventListener("click", () => {
  if ($("adminPin").value !== ADMIN_PIN) { alert("Senha incorreta."); return; }
  adminUnlocked = true;
  $("adminPanel").classList.remove("hidden");
  $("adminPin").value = "";
  showResults();
});
$("openPoll").addEventListener("click", () => {
  if (!adminUnlocked) return;
  localStorage.setItem(POLL_KEY, "true"); updatePollStatus();
  alert("Votação aberta.");
});
$("closePoll").addEventListener("click", () => {
  if (!adminUnlocked || !confirm("Deseja realmente encerrar a votação?")) return;
  localStorage.setItem(POLL_KEY, "false"); updatePollStatus(); showResults();
});
$("showResults").addEventListener("click", showResults);
$("printResults").addEventListener("click", () => { showResults(); window.print(); });
$("resetVotes").addEventListener("click", () => {
  if (!adminUnlocked) return;
  if (confirm("Tem certeza de que deseja apagar todos os votos deste dispositivo? Esta ação não pode ser desfeita.")) {
    setVotes([]); showResults();
  }
});
renderCandidates();
updateDisplay();
updatePollStatus();
