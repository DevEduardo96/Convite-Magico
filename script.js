document.addEventListener("DOMContentLoaded", () => {
  // --- LÓGICA DA INTRO (ENVELOPE E BALÕES) ---
  const envelope = document.getElementById("envelope");
  const introOverlay = document.getElementById("intro-overlay");
  const gameContainer = document.getElementById("game-container");
  let gameStarted = false;

  // 1. Inicia os balões flutuantes
  createBalloons();

  envelope.addEventListener("click", () => {
    if (gameStarted) return;
    gameStarted = true;

    envelope.classList.add("open");

    // --- ADICIONE ESTA LINHA AQUI ---
    const musica = document.getElementById("musica-real");
    musica.play().catch((e) => console.log("Erro ao tocar música:", e));
    // --------------------------------

    setTimeout(() => {
      introOverlay.style.opacity = "0";
      setTimeout(() => {
        introOverlay.style.display = "none";
        // Remove os balões para economizar memória do celular
        document.querySelectorAll(".balloon").forEach((b) => b.remove());

        gameContainer.classList.remove("hidden");
        initGame();
      }, 800);
    }, 1500);
  });

  // Função para criar balões aleatórios
  function createBalloons() {
    const colors = ["#ff69b4", "#9c27b0", "#ffc107", "#03a9f4", "#4caf50"];
    const numBalloons = 15; // Quantidade de balões

    for (let i = 0; i < numBalloons; i++) {
      const balloon = document.createElement("div");
      balloon.classList.add("balloon");

      // Propriedades aleatórias via CSS variables
      const size = Math.floor(Math.random() * 30) + 40; // entre 40 e 70px
      balloon.style.setProperty("--size", `${size}px`);
      balloon.style.setProperty(
        "--color",
        colors[Math.floor(Math.random() * colors.length)],
      );
      balloon.style.left = `${Math.random() * 90}vw`; // Posição horizontal
      balloon.style.setProperty(
        "--duration",
        `${Math.floor(Math.random() * 10) + 8}s`,
      ); // Velocidade
      balloon.style.setProperty("--delay", `${Math.random() * 5}s`); // Atraso inicial

      introOverlay.appendChild(balloon);
    }
  }

  // --- LÓGICA DO JOGO (TABULEIRO) ---
  const boardEl = document.getElementById("board");
  const princess = document.createElement("div");
  princess.classList.add("princess");
  princess.textContent = "👸";

  const totalTiles = 12;
  const obstacles = {
    3: {
      question: "Qual o desenho favorito dela?",
      options: ["Blippi", "Maria Clara e jp", "Peppa pig"],
      correct: 1,
    },
    7: {
      question: "Quantos anos ela vai fazer?",
      options: ["2", "3", "4"],
      correct: 2,
    },
  };
  let currentPosition = 0;
  let isMoving = false;

  function initGame() {
    for (let i = 0; i < totalTiles; i++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      tile.dataset.index = i;
      if (i === 0) (tile.classList.add("start"), (tile.textContent = "Início"));
      else if (i === totalTiles - 1)
        (tile.classList.add("castle"), (tile.textContent = "🏰"));
      else if (obstacles[i])
        (tile.classList.add("question"), (tile.textContent = "?"));
      else tile.textContent = i;
      boardEl.appendChild(tile);
    }
    movePrincessTo(0);
  }

  function movePrincessTo(index) {
    const targetTile = document.querySelector(`.tile[data-index='${index}']`);
    if (targetTile) targetTile.appendChild(princess);
  }

  document.getElementById("roll-btn").addEventListener("click", async () => {
    if (isMoving) return;
    isMoving = true;
    document.getElementById("roll-btn").disabled = true;
    const diceDisplay = document.getElementById("dice-display");

    // Animação dado
    for (let i = 0; i < 10; i++) {
      let r = Math.floor(Math.random() * 3) + 1;
      diceDisplay.textContent = ["⚀", "⚁", "⚂"][r - 1];
      await new Promise((r) => setTimeout(r, 80));
    }
    let roll = Math.floor(Math.random() * 3) + 1;
    diceDisplay.textContent = ["⚀", "⚁", "⚂"][roll - 1];

    await moveStepByStep(roll);
    document.getElementById("roll-btn").disabled = false;
    isMoving = false;
  });

  async function moveStepByStep(steps) {
    for (let i = 0; i < steps; i++) {
      if (currentPosition < totalTiles - 1) {
        currentPosition++;
        movePrincessTo(currentPosition);
        await new Promise((r) => setTimeout(r, 400));
      }
    }
    checkTile();
  }

  function checkTile() {
    if (currentPosition === totalTiles - 1) {
      setTimeout(() => {
        // FIM DE JOGO - MOSTRA TELA FINAL
        document.getElementById("win-modal").classList.remove("hidden");
        // INICIA O SLIDESHOW
        startSlideshow();
      }, 300);
      return;
    }
    if (obstacles[currentPosition]) {
      showQuestion(obstacles[currentPosition]);
    }
  }

  // --- LÓGICA DO SLIDESHOW ---
  function startSlideshow() {
    const slides = document.querySelectorAll(".slide");
    let currentSlideIdx = 0;

    // Troca de slide a cada 3 segundos
    setInterval(() => {
      slides[currentSlideIdx].classList.remove("active-slide");
      currentSlideIdx = (currentSlideIdx + 1) % slides.length; // Loop infinito
      slides[currentSlideIdx].classList.add("active-slide");
    }, 3000);
  }

  // --- LÓGICA DAS PERGUNTAS ---
  function showQuestion(obstacleData) {
    const modal = document.getElementById("question-modal");
    const ansContainer = document.getElementById("answers-container");
    document.getElementById("question-text").textContent =
      obstacleData.question;
    document.getElementById("feedback-msg").textContent = "";
    ansContainer.innerHTML = "";
    modal.classList.remove("hidden");

    obstacleData.options.forEach((opt, index) => {
      const btn = document.createElement("button");
      btn.classList.add("answer-btn");
      btn.textContent = opt;
      btn.onclick = () => {
        if (index === obstacleData.correct) {
          modal.classList.add("hidden");
          if (currentPosition < totalTiles - 1) {
            currentPosition++;
            movePrincessTo(currentPosition);
          }
        } else {
          document.getElementById("feedback-msg").textContent =
            "Tente de novo na próxima rodada!";
          document.getElementById("feedback-msg").style.color = "#e91e63";
          setTimeout(() => modal.classList.add("hidden"), 1500);
        }
      };
      ansContainer.appendChild(btn);
    });
  }
});
