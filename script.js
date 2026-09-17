(() => {
  "use strict";

  // ===== CUSTOMIZE HERE =====
  // Replace the name, message, photo filenames, or music filename in this one block.
  const BIRTHDAY_CONFIG = {
    friendName: "Zinia Ahmed",
    displayName: "Zinia (Airav)",
    finalName: "Airav",
    photo1: "photo1.jpeg",
    photo2: "photo2.jpeg",
    musicFile: "happy-birthday.mp3",
    birthdayMessage: `Happy Birthday to one of the most amazing people in my life! ❤️

May your special day be filled with happiness, laughter,
beautiful memories, and everything your heart wishes for.

You deserve all the love, happiness, and success in the world.
Keep smiling, keep shining, and never stop being the wonderful
person you are.

May this new chapter of your life bring you countless beautiful
moments and unforgettable memories.

Happy Birthday once again! 🎂✨❤️`,
  };

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.addEventListener("DOMContentLoaded", () => {
    const audio = $("#birthdayMusic");
    const musicButton = $("#musicButton");
    const musicIcon = $("#musicIcon");
    const musicLabel = $("#musicLabel");
    const musicPrompt = $("#musicPrompt");
    const typedMessage = $("#typedMessage");
    const wishButton = $("#wishButton");
    const wishCake = $("#wishCake");
    const wishResult = $("#wishResult");
    const finale = $("#finale");
    const celebrationLayer = $("#celebrationLayer");

    applyPersonalization(audio);
    createAmbientParticles();
    startLoadingSequence();
    setupRevealAnimations(typedMessage);
    setupMusic(audio, musicButton, musicIcon, musicLabel, musicPrompt);

    $("#surpriseButton").addEventListener("click", (event) => {
      burstAt(event.clientX, event.clientY, 22, celebrationLayer);
      launchConfetti(50, celebrationLayer);
      document.querySelector("#message").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    wishButton.addEventListener("click", () => {
      if (wishButton.disabled) return;
      wishButton.disabled = true;
      wishButton.innerHTML = '<span aria-hidden="true">♡</span> Wish Sent';
      wishCake.classList.add("is-wished");
      wishResult.classList.add("is-visible");
      launchConfetti(135, celebrationLayer);
      showerHearts(35, celebrationLayer);
    });

    $("#celebrateButton").addEventListener("click", () => {
      finale.classList.remove("is-celebrating");
      void finale.offsetWidth;
      finale.classList.add("is-celebrating");
      launchConfetti(155, celebrationLayer);
      showerHearts(45, celebrationLayer);
      burstAt(window.innerWidth / 2, window.innerHeight / 2, 35, celebrationLayer);
      window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 420);
    });
  });

  function applyPersonalization(audio) {
    document.title = `Happy Birthday, ${BIRTHDAY_CONFIG.friendName}`;
    $$('[data-display-name]').forEach((element) => { element.textContent = BIRTHDAY_CONFIG.displayName; });
    $$('[data-first-name]').forEach((element) => { element.textContent = BIRTHDAY_CONFIG.friendName.split(" ")[0]; });
    $$('[data-final-name]').forEach((element) => { element.textContent = BIRTHDAY_CONFIG.finalName; });
    $$('[data-photo="1"]').forEach((image) => { image.src = BIRTHDAY_CONFIG.photo1; });
    $$('[data-photo="2"]').forEach((image) => { image.src = BIRTHDAY_CONFIG.photo2; });
    audio.src = BIRTHDAY_CONFIG.musicFile;
    audio.load();
  }

  function startLoadingSequence() {
    window.setTimeout(() => document.body.classList.add("is-loaded"), prefersReducedMotion ? 100 : 1100);
  }

  function setupMusic(audio, button, icon, label, prompt) {
    let userStartedMusic = false;
    let audioUnavailable = false;

    const updateMusicButton = () => {
      const playing = !audio.paused && !audio.ended;
      icon.textContent = playing ? "🎵" : "🔇";
      label.textContent = playing ? "Music On" : "Music Off";
      button.classList.toggle("is-playing", playing);
      button.setAttribute("aria-label", playing ? "Pause birthday music" : "Play birthday music");
    };

    const showPrompt = () => {
      if (!audioUnavailable) prompt.hidden = false;
    };

    const playMusic = () => {
      if (audioUnavailable) return;
      audio.play()
        .then(() => {
          userStartedMusic = true;
          prompt.hidden = true;
          updateMusicButton();
        })
        .catch(() => {
          showPrompt();
          updateMusicButton();
        });
    };

    audio.addEventListener("play", updateMusicButton);
    audio.addEventListener("pause", updateMusicButton);
    audio.addEventListener("error", () => {
      audioUnavailable = true;
      prompt.hidden = true;
      updateMusicButton();
    });

    button.addEventListener("click", (event) => {
      event.stopPropagation();
      if (audioUnavailable) return;
      if (audio.paused) playMusic();
      else {
        audio.pause();
        prompt.hidden = true;
      }
    });

    const startAfterInteraction = (event) => {
      const source = event.target instanceof Element ? event.target : null;
      if (userStartedMusic || audioUnavailable || source?.closest("#musicButton")) return;
      playMusic();
    };

    document.addEventListener("pointerdown", startAfterInteraction, { passive: true });
    document.addEventListener("keydown", startAfterInteraction);

    // Browsers that permit autoplay will begin the local song without any extra tap.
    window.setTimeout(playMusic, 250);
    updateMusicButton();
  }

  function setupRevealAnimations(typedMessage) {
    const revealItems = $$(".reveal");
    let messageStarted = false;

    const reveal = (element) => {
      element.classList.add("is-visible");
      if (element.closest("#message") && !messageStarted) {
        messageStarted = true;
        typeMessage(typedMessage, BIRTHDAY_CONFIG.birthdayMessage);
      }
    };

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach(reveal);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: .16 });

    revealItems.forEach((item) => observer.observe(item));
  }

  function typeMessage(target, message) {
    if (prefersReducedMotion) {
      target.textContent = message;
      return;
    }

    let index = 0;
    target.classList.add("is-typing");
    const typeNextCharacter = () => {
      target.textContent += message.charAt(index);
      index += 1;
      if (index < message.length) {
        const previousCharacter = message.charAt(index - 1);
        window.setTimeout(typeNextCharacter, previousCharacter === "\n" ? 45 : 12);
      } else {
        target.classList.remove("is-typing");
      }
    };
    typeNextCharacter();
  }

  function createAmbientParticles() {
    const layer = $("#ambientLayer");
    const glyphs = ["✦", "·", "✧", "♡"];
    const colors = ["#ffd6ec", "#c8eaff", "#fff1b6", "#e4c3ff"];
    const count = window.innerWidth < 600 ? 15 : 25;

    for (let i = 0; i < count; i += 1) {
      const particle = document.createElement("span");
      particle.className = "ambient-particle";
      particle.textContent = glyphs[i % glyphs.length];
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.setProperty("--particle-size", `${6 + Math.random() * 12}px`);
      particle.style.setProperty("--particle-color", colors[i % colors.length]);
      particle.style.setProperty("--particle-duration", `${12 + Math.random() * 13}s`);
      particle.style.setProperty("--particle-delay", `${-Math.random() * 16}s`);
      particle.style.setProperty("--particle-drift", `${-45 + Math.random() * 90}px`);
      layer.appendChild(particle);
    }
  }

  function launchConfetti(amount, layer) {
    const colors = ["#ff74b5", "#9f72ff", "#71c8ff", "#ffe68c", "#ffb8d8", "#9df0d1"];
    for (let i = 0; i < amount; i += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.top = `${-8 - Math.random() * 20}px`;
      piece.style.setProperty("--piece-color", colors[i % colors.length]);
      piece.style.setProperty("--piece-w", `${5 + Math.random() * 7}px`);
      piece.style.setProperty("--piece-h", `${7 + Math.random() * 11}px`);
      piece.style.setProperty("--piece-radius", Math.random() > .55 ? "50%" : "2px");
      piece.style.setProperty("--piece-time", `${1.9 + Math.random() * 1.8}s`);
      piece.style.setProperty("--piece-delay", `${Math.random() * .45}s`);
      piece.style.setProperty("--piece-x", `${-150 + Math.random() * 300}px`);
      piece.style.setProperty("--piece-rotate", `${360 + Math.random() * 1080}deg`);
      piece.addEventListener("animationend", () => piece.remove());
      layer.appendChild(piece);
    }
  }

  function showerHearts(amount, layer) {
    const colors = ["#ff9cca", "#ffe0f0", "#cca6ff", "#ffd576"];
    for (let i = 0; i < amount; i += 1) {
      const heart = document.createElement("span");
      heart.className = "celebration-heart";
      heart.textContent = i % 4 === 0 ? "♡" : "♥";
      heart.style.left = `${8 + Math.random() * 84}%`;
      heart.style.top = `${55 + Math.random() * 35}%`;
      heart.style.setProperty("--heart-color", colors[i % colors.length]);
      heart.style.setProperty("--heart-size", `${13 + Math.random() * 19}px`);
      heart.style.setProperty("--heart-time", `${2.1 + Math.random() * 2}s`);
      heart.style.setProperty("--heart-delay", `${Math.random() * .7}s`);
      heart.style.setProperty("--heart-x", `${-90 + Math.random() * 180}px`);
      heart.style.setProperty("--heart-y", `${-45 - Math.random() * 65}vh`);
      heart.style.setProperty("--heart-rotate", `${-60 + Math.random() * 120}deg`);
      heart.addEventListener("animationend", () => heart.remove());
      layer.appendChild(heart);
    }
  }

  function burstAt(x, y, amount, layer) {
    const colors = ["#ffadd4", "#fff0a8", "#afdcff", "#ddbdff"];
    for (let i = 0; i < amount; i += 1) {
      const piece = document.createElement("span");
      const angle = (Math.PI * 2 * i) / amount + Math.random() * .2;
      const distance = 38 + Math.random() * 95;
      piece.className = "burst-piece";
      piece.style.left = `${x}px`;
      piece.style.top = `${y}px`;
      piece.style.setProperty("--burst-color", colors[i % colors.length]);
      piece.style.setProperty("--burst-x", `${Math.cos(angle) * distance}px`);
      piece.style.setProperty("--burst-y", `${Math.sin(angle) * distance}px`);
      piece.addEventListener("animationend", () => piece.remove());
      layer.appendChild(piece);
    }
  }
})();
