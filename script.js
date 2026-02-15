document.addEventListener("DOMContentLoaded", () => {
  // --- LÓGICA DE GALERIA AVANÇADA ---
  const imageViewer = document.getElementById("image-viewer");
  const fullImage = document.getElementById("full-image");
  const closeViewer = document.querySelector(".close-viewer");
  const btnNext = document.getElementById("next-photo");
  const btnPrev = document.getElementById("prev-photo");

  let currentImageIndex = 0;
  const allPhotos = Array.from(document.querySelectorAll(".gallery-img"));

  const updateModalImage = (index) => {
    currentImageIndex = index;
    fullImage.src = allPhotos[currentImageIndex].src;
  };

  // Abrir modal
  allPhotos.forEach((img, index) => {
    img.addEventListener("click", () => {
      updateModalImage(index);
      imageViewer.classList.remove("hidden");
      imageViewer.style.display = "flex";
    });
  });

  // Navegação
  const nextPhoto = () => {
    let nextIdx = (currentImageIndex + 1) % allPhotos.length;
    updateModalImage(nextIdx);
  };

  const prevPhoto = () => {
    let prevIdx = (currentImageIndex - 1 + allPhotos.length) % allPhotos.length;
    updateModalImage(prevIdx);
  };

  btnNext.onclick = (e) => {
    e.stopPropagation();
    nextPhoto();
  };
  btnPrev.onclick = (e) => {
    e.stopPropagation();
    prevPhoto();
  };

  // --- SUPORTE A SWIPE (Deslizar o dedo) ---
  let touchStartX = 0;
  let touchEndX = 0;

  imageViewer.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    false,
  );

  imageViewer.addEventListener(
    "touchend",
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    },
    false,
  );

  function handleSwipe() {
    const swipeThreshold = 50; // pixels mínimos para considerar um deslize
    if (touchEndX < touchStartX - swipeThreshold) nextPhoto(); // Deslizou para esquerda -> Próxima
    if (touchEndX > touchStartX + swipeThreshold) prevPhoto(); // Deslizou para direita -> Anterior
  }

  // Fechar
  const hideViewer = () => {
    imageViewer.classList.add("hidden");
    imageViewer.style.display = "none";
  };

  closeViewer.onclick = hideViewer;
  imageViewer.onclick = (e) => {
    if (e.target === imageViewer) hideViewer();
  };
  // --- ELEMENTOS DO DOM ---
  const introOverlay = document.getElementById("intro-overlay");
  const envelope = document.getElementById("envelope");
  const appHeader = document.getElementById("app-header");

  // Telas
  const mainMenu = document.getElementById("main-menu");
  const gameContainer = document.getElementById("game-container");
  const galleryContainer = document.getElementById("gallery-container");
  const invitationContainer = document.getElementById("invitation-container"); // NOVA TELA

  // Botões do Menu
  const btnPlay = document.getElementById("btn-play");
  const btnPhotos = document.getElementById("btn-photos");
  const btnInvite = document.getElementById("btn-invite"); // NOVO BOTÃO

  // Modais e Avisos
  const notifBtn = document.getElementById("notif-btn");
  const notifModal = document.getElementById("notification-modal");
  const closeNotif = document.getElementById("close-notif");
  const photoAlertModal = document.getElementById("photo-alert-modal");
  const confirmPhotoBtn = document.getElementById("confirm-photo-btn");

  // Elementos do Jogo
  const boardEl = document.getElementById("board");
  const diceDisplay = document.getElementById("dice-display");
  const rollBtn = document.getElementById("roll-btn");
  const questionModal = document.getElementById("question-modal");
  const winModal = document.getElementById("win-modal");

  let introCompleted = false;
  let isMoving = false;
  let currentPosition = 0;

  const totalTiles = 12;
  const obstacles = {
    3: {
      question: "Qual o desenho favorito dela?",
      options: ["Blippi", "Maria Clara e JP", "Peppa Pig"],
      correct: 1,
    },
    7: {
      question: "Quantos anos ela vai fazer?",
      options: ["2 aninhos", "3 aninhos", "4 aninhos"],
      correct: 2,
    },
  };

  // --- 1. INTRODUÇÃO ---
  createBalloons();

  envelope.addEventListener("click", () => {
    if (introCompleted) return;
    introCompleted = true;
    envelope.classList.add("open");
    const musica = document.getElementById("musica-real");
    musica.play().catch((e) => console.log("Erro ao tocar música:", e));

    setTimeout(() => {
      introOverlay.style.opacity = "0";
      setTimeout(() => {
        introOverlay.style.display = "none";
        document.querySelectorAll(".balloon").forEach((b) => b.remove());
        appHeader.classList.remove("hidden");
        mainMenu.classList.remove("hidden");
      }, 800);
    }, 1500);
  });

  function createBalloons() {
    const colors = ["#ff69b4", "#9c27b0", "#ffc107", "#03a9f4", "#4caf50"];
    for (let i = 0; i < 15; i++) {
      const balloon = document.createElement("div");
      balloon.classList.add("balloon");
      const size = Math.floor(Math.random() * 30) + 40;
      balloon.style.setProperty("--size", `${size}px`);
      balloon.style.setProperty(
        "--color",
        colors[Math.floor(Math.random() * colors.length)],
      );
      balloon.style.left = `${Math.random() * 90}vw`;
      balloon.style.setProperty(
        "--duration",
        `${Math.floor(Math.random() * 10) + 8}s`,
      );
      balloon.style.setProperty("--delay", `${Math.random() * 5}s`);
      introOverlay.appendChild(balloon);
    }
  }

  // --- 2. NAVEGAÇÃO DO MENU ---

  // Botão JOGAR
  btnPlay.addEventListener("click", () => {
    mainMenu.classList.add("hidden");
    gameContainer.classList.remove("hidden");
    if (boardEl.innerHTML === "") initGame();
  });

  // Botão VER FOTOS (Com alerta)
  btnPhotos.addEventListener("click", () => {
    photoAlertModal.classList.remove("hidden");
  });

  confirmPhotoBtn.addEventListener("click", () => {
    photoAlertModal.classList.add("hidden");
    mainMenu.classList.add("hidden");
    galleryContainer.classList.remove("hidden");
  });

  // Botão VER CONVITE (NOVO - Acesso Direto)
  btnInvite.addEventListener("click", () => {
    mainMenu.classList.add("hidden");
    invitationContainer.classList.remove("hidden");
    // Inicia o slideshow para a tela de convite também
    startSlideshow();
  });

  // Função VOLTAR global
  window.goBackToMenu = function () {
    gameContainer.classList.add("hidden");
    galleryContainer.classList.add("hidden");
    invitationContainer.classList.add("hidden"); // Esconde o convite
    winModal.classList.add("hidden");
    mainMenu.classList.remove("hidden");
  };

  // --- 3. NOTIFICAÇÕES ---
  notifBtn.addEventListener("click", () => {
    notifModal.classList.remove("hidden");
    const badge = notifBtn.querySelector(".badge");
    if (badge) badge.style.display = "none";
  });
  closeNotif.addEventListener("click", () => {
    notifModal.classList.add("hidden");
  });

  // --- 4. LÓGICA DO JOGO ---
  const princess = document.createElement("div");
  princess.classList.add("princess");
  princess.innerHTML = `<img src="./images/princesa.png" class="player-token" style="width:50px; height:50px; object-fit:contain;">`;

  function initGame() {
    boardEl.innerHTML = "";
    currentPosition = 0;
    for (let i = 0; i < totalTiles; i++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      tile.dataset.index = i;
      if (i === 0) {
        tile.classList.add("start");
        tile.textContent = "Início";
      } else if (i === totalTiles - 1) {
        tile.classList.add("castle");
        tile.textContent = "🏰";
      } else if (obstacles[i]) {
        tile.classList.add("question");
        tile.textContent = "?";
      } else {
        tile.textContent = i;
      }
      boardEl.appendChild(tile);
    }
    movePrincessTo(0);
  }

  function movePrincessTo(index) {
    const targetTile = document.querySelector(`.tile[data-index='${index}']`);
    if (targetTile) targetTile.appendChild(princess);
  }

  rollBtn.addEventListener("click", async () => {
    if (isMoving) return;
    isMoving = true;
    rollBtn.disabled = true;
    rollBtn.style.opacity = "0.6";

    for (let i = 0; i < 10; i++) {
      let r = Math.floor(Math.random() * 3) + 1;
      diceDisplay.textContent = ["⚀", "⚁", "⚂"][r - 1];
      await new Promise((r) => setTimeout(r, 80));
    }
    let roll = Math.floor(Math.random() * 3) + 1;
    diceDisplay.textContent = ["⚀", "⚁", "⚂"][roll - 1];

    await moveStepByStep(roll);
    rollBtn.disabled = false;
    rollBtn.style.opacity = "1";
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
        winModal.classList.remove("hidden");
        startSlideshow();
      }, 300);
      return;
    }
    if (obstacles[currentPosition]) showQuestion(obstacles[currentPosition]);
  }

  // --- MODAL DE PERGUNTAS ---
  function showQuestion(obstacleData) {
    const ansContainer = document.getElementById("answers-container");
    const feedbackMsg = document.getElementById("feedback-msg");
    document.getElementById("question-text").textContent =
      obstacleData.question;
    feedbackMsg.textContent = "";
    ansContainer.innerHTML = "";
    questionModal.classList.remove("hidden");

    obstacleData.options.forEach((opt, index) => {
      const btn = document.createElement("button");
      btn.classList.add("answer-btn");
      btn.textContent = opt;
      btn.onclick = () => {
        ansContainer
          .querySelectorAll("button")
          .forEach((b) => (b.style.pointerEvents = "none"));
        if (index === obstacleData.correct) {
          feedbackMsg.textContent = "Correto! Avançe! 🌟";
          feedbackMsg.style.color = "#4caf50";
          setTimeout(() => {
            if (currentPosition < totalTiles - 1) {
              currentPosition++;
              movePrincessTo(currentPosition);
            }
            setTimeout(() => {
              questionModal.classList.add("hidden");
              checkTile();
            }, 1000);
          }, 800);
        } else {
          feedbackMsg.textContent = "Errado! Volte uma casa! 🙊";
          feedbackMsg.style.color = "#e91e63";
          setTimeout(() => {
            if (currentPosition > 0) {
              currentPosition--;
              movePrincessTo(currentPosition);
            }
            setTimeout(() => {
              questionModal.classList.add("hidden");
            }, 1000);
          }, 800);
        }
      };
      ansContainer.appendChild(btn);
    });
  }

  // --- SLIDESHOW (COMPARTILHADO PELO CONVITE E PELO JOGO) ---
  function startSlideshow() {
    // Seleciona todos os slideshows (tanto da tela de convite quanto do modal de vitória)
    const containers = document.querySelectorAll(".slideshow-container");

    if (window.slideInterval) clearInterval(window.slideInterval);

    window.slideInterval = setInterval(() => {
      containers.forEach((container) => {
        const slides = container.querySelectorAll(".slide");
        if (slides.length === 0) return;

        // Encontra o slide ativo atual neste container
        let activeIndex = -1;
        slides.forEach((slide, idx) => {
          if (slide.classList.contains("active-slide")) {
            activeIndex = idx;
            slide.classList.remove("active-slide");
          }
        });

        // Define o próximo
        let nextIndex = (activeIndex + 1) % slides.length;
        slides[nextIndex].classList.add("active-slide");
      });
    }, 3000);
  }
});
// Captura os elementos de áudio e vídeo
const musicaFundo = document.getElementById("musica-real");
const videoGaleria = document.getElementById("video-galeria");
const btnAbrirGaleria = document.getElementById("btn-photos"); // Ou o botão que confirma abrir as fotos

// 1. Função para quando ENTRAR no Álbum
btnAbrirGaleria.addEventListener("click", function () {
  // Pausa a música da festa
  if (musicaFundo) {
    musicaFundo.pause();
  }

  // Dá o play no vídeo com o som ativado
  if (videoGaleria) {
    videoGaleria.currentTime = 0; // Faz o vídeo começar do zero
    videoGaleria.play().catch((error) => {
      console.log("O navegador pediu para o usuário dar play manualmente.");
    });
  }
});

// 2. Atualize a sua função goBackToMenu() existente para pausar o vídeo e voltar a música
function goBackToMenu() {
  // (Mantenha o código que você já tem aqui dentro para esconder as telas)
  document.getElementById("gallery-container").classList.add("hidden");
  document.getElementById("game-container").classList.add("hidden");
  document.getElementById("invitation-container").classList.add("hidden");
  document.getElementById("main-menu").classList.remove("hidden");

  // PAUSA o vídeo da galeria se ele estiver tocando
  if (videoGaleria) {
    videoGaleria.pause();
  }

  // VOLTA a tocar a música de fundo
  if (musicaFundo) {
    musicaFundo.play();
  }
}
