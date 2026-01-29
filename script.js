document.addEventListener("DOMContentLoaded", () => {
  // --- LÓGICA DO ENVELOPE ---
  const envelope = document.getElementById("envelope");
  const introOverlay = document.getElementById("intro-overlay");
  const gameContainer = document.getElementById("game-container");
  let gameStarted = false;

  envelope.addEventListener("click", () => {
    if (gameStarted) return;
    gameStarted = true;

    // 1. Anima o envelope abrindo
    envelope.classList.add("open");

    // 2. Espera a carta subir e então troca as telas
    setTimeout(() => {
      // Fade out na tela de intro
      introOverlay.style.opacity = "0";

      setTimeout(() => {
        introOverlay.style.display = "none"; // Remove intro
        gameContainer.classList.remove("hidden"); // Mostra jogo
        initGame(); // Inicia o tabuleiro
      }, 1000); // Tempo para o fade out terminar
    }, 1500); // Tempo da animação da carta subindo
  });

  // --- LÓGICA DO JOGO ---
  const boardEl = document.getElementById("board");
  const princess = document.createElement("div");
  princess.classList.add("princess");
  princess.textContent = "👸";

  const totalTiles = 12;
  // Configure suas perguntas aqui
  const obstacles = {
    3: {
      question: "Qual o desenho favorito da aniversariante?",
      options: ["Peppa Pig", "Maria clara e jp", "Blippi"],
      correct: 1,
    },
    7: {
      question: "Quantos aninhos ela vai fazer?",
      options: ["2", "3", "4"],
      correct: 2,
    },
  };

  let currentPosition = 0;
  let isMoving = false;

  function initGame() {
    // Cria o tabuleiro apenas quando o jogo começa
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
    const diceDisplay = document.getElementById("dice-display");
    const btn = document.getElementById("roll-btn");
    btn.disabled = true;

    // Animação dado
    for (let i = 0; i < 10; i++) {
      let r = Math.floor(Math.random() * 3) + 1;
      diceDisplay.textContent = ["⚀", "⚁", "⚂"][r - 1];
      await new Promise((r) => setTimeout(r, 80));
    }

    // Resultado final
    let roll = Math.floor(Math.random() * 3) + 1;
    diceDisplay.textContent = ["⚀", "⚁", "⚂"][roll - 1];

    // Move
    await moveStepByStep(roll);

    btn.disabled = false;
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
        document.getElementById("win-modal").classList.remove("hidden");
        // Aqui você pode adicionar efeitos de confete
      }, 300);
      return;
    }
    if (obstacles[currentPosition]) {
      showQuestion(obstacles[currentPosition]);
    }
  }

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
          // Avança +1 se acertar (opcional)
          if (currentPosition < totalTiles - 1) {
            currentPosition++;
            movePrincessTo(currentPosition);
          }
        } else {
          document.getElementById("feedback-msg").textContent =
            "Ops! Tente de novo na próxima.";
          document.getElementById("feedback-msg").style.color = "red";
          setTimeout(() => modal.classList.add("hidden"), 1500);
        }
      };
      ansContainer.appendChild(btn);
    });
  }
});
