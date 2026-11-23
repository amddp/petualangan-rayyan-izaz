(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const screens = ["homeScreen", "menuScreen", "gameScreen"];
  const praise = ["Hebat!", "Pintar sekali!", "Wah, luar biasa!", "Kamu keren!"];
  const state = {
    profile: "rayyan",
    gameId: null,
    round: 0,
    stars: Number(localStorage.getItem("priz-stars") || 0),
    completed: JSON.parse(localStorage.getItem("priz-completed") || "{}"),
    sound: localStorage.getItem("priz-sound") !== "off",
    currentInstruction: "",
    balloonCount: 0,
    puzzlePlaced: []
  };

  const games = {
    izaz: [
      { id:"animals", title:"Sentuh Hewan", icon:"🐾", desc:"Kenali hewan dan suaranya" },
      { id:"colors", title:"Sentuh Warna", icon:"🎨", desc:"Kenali warna ceria" },
      { id:"balloons", title:"Balon Ceria", icon:"🎈", desc:"Sentuh balon yang melayang" },
      { id:"fruits", title:"Buah-Buahan", icon:"🍎", desc:"Kenali buah-buahan" }
    ],
    rayyan: [
      { id:"matchColors", title:"Cocokkan Warna", icon:"🖍️", desc:"Pasangkan warna yang sama" },
      { id:"shapes", title:"Cocokkan Bentuk", icon:"🔺", desc:"Cari bentuk yang sesuai" },
      { id:"puzzle", title:"Puzzle Hewan", icon:"🧩", desc:"Susun gambar hewan" },
      { id:"collect", title:"Kumpulkan Buah", icon:"🍓", desc:"Cari buah sesuai instruksi" },
      { id:"numbers", title:"Petualangan Angka", icon:"🔢", desc:"Belajar menghitung 1–5" }
    ]
  };

  const animalData = [
    {name:"Kucing", emoji:"🐱", sound:"Meong, meong!"},
    {name:"Ayam", emoji:"🐔", sound:"Kukuruyuk!"},
    {name:"Sapi", emoji:"🐮", sound:"Moo, moo!"},
    {name:"Bebek", emoji:"🦆", sound:"Kwek, kwek!"},
    {name:"Kambing", emoji:"🐐", sound:"Mbee, mbee!"}
  ];
  const colorData = [
    {name:"Merah", color:"#f45b69"},{name:"Kuning",color:"#ffd447"},
    {name:"Biru",color:"#55a9e8"},{name:"Hijau",color:"#62c887"},
    {name:"Jingga",color:"#ff9b45"}
  ];
  const fruitData = [
    {name:"Apel",emoji:"🍎"},{name:"Pisang",emoji:"🍌"},
    {name:"Jeruk",emoji:"🍊"},{name:"Anggur",emoji:"🍇"},
    {name:"Stroberi",emoji:"🍓"}
  ];
  const shapeData = [
    {name:"Lingkaran",emoji:"🟠"},{name:"Segitiga",emoji:"🔺"},
    {name:"Persegi",emoji:"🟦"},{name:"Bintang",emoji:"⭐"}
  ];
  const animalPuzzles = [
    {name:"Kucing",emoji:"🐱"},{name:"Singa",emoji:"🦁"},
    {name:"Panda",emoji:"🐼"},{name:"Kelinci",emoji:"🐰"}
  ];

  function showScreen(id) {
    screens.forEach(screen => $("#" + screen).classList.toggle("active", screen === id));
    window.scrollTo({top:0, behavior:"smooth"});
  }
  function speak(text) {
    state.currentInstruction = text;
    if (!state.sound) return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "id-ID";
      utterance.rate = 0.86;
      utterance.pitch = 1.12;
      window.speechSynthesis.speak(utterance);
    }
  }
  function sayPraise() {
    const line = praise[Math.floor(Math.random() * praise.length)];
    $("#feedback").textContent = "🌟 " + line;
    speak(line);
  }
  function toast(message) {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove("show"), 1800);
  }
  function updateStars() {
    $("#starCount").textContent = state.stars;
    $("#gameStarCount").textContent = state.stars;
    const max = state.profile === "izaz" ? 4 : 5;
    const done = Object.keys(state.completed[state.profile] || {}).length;
    $("#progressFill").style.width = Math.min(100, done / max * 100) + "%";
    localStorage.setItem("priz-stars", String(state.stars));
    localStorage.setItem("priz-completed", JSON.stringify(state.completed));
  }
  function awardStar(gameId) {
    if (!state.completed[state.profile]) state.completed[state.profile] = {};
    if (!state.completed[state.profile][gameId]) {
      state.completed[state.profile][gameId] = true;
      state.stars += 1;
      updateStars();
      toast("⭐ Satu bintang untukmu!");
    }
  }
  function enterProfile(profile) {
    state.profile = profile;
    const name = profile === "rayyan" ? "Rayyan" : "Izaz";
    const age = profile === "rayyan" ? "3 tahun" : "1 tahun";
    $("#menuTitle").textContent = `Halo, ${name}! 👋`;
    $("#menuSubtitle").textContent = `${age} • Pilih permainan yang kamu suka.`;
    $("#welcomeEyebrow").textContent = `SELAMAT BERMAIN, ${name.toUpperCase()}`;
    renderGameMenu();
    updateStars();
    showScreen("menuScreen");
    speak(`Halo ${name}! Ayo kita bermain.`);
  }
  function renderGameMenu() {
    $("#gameGrid").innerHTML = games[state.profile].map((game, index) => `
      <button class="game-card" data-game="${game.id}" style="--tile:${["#fff0c9","#e5f4ff","#ffe5ed","#e8f8e9","#eee8ff"][index % 5]}">
        <span class="game-card-icon">${game.icon}</span>
        <span><strong>${game.title}</strong><small>${game.desc}</small></span>
      </button>`).join("");
    $("#gameGrid").querySelectorAll("[data-game]").forEach(button => {
      button.addEventListener("click", () => startGame(button.dataset.game));
    });
  }
  function startGame(gameId) {
    state.gameId = gameId;
    state.round = 0;
    state.balloonCount = 0;
    state.puzzlePlaced = [];
    $("#feedback").textContent = "Ayo kita bermain! 😊";
    showScreen("gameScreen");
    renderCurrentGame();
  }
  function setGameHeader(icon, title, instruction) {
    $("#gameIcon").textContent = icon;
    $("#gameTitle").textContent = title;
    $("#gameInstruction").textContent = instruction;
    state.currentInstruction = instruction;
    $("#nextButton").style.display = "inline-block";
    $("#nextButton").textContent = "Lanjut ➜";
  }
  function shuffle(items) { return [...items].sort(() => Math.random() - .5); }
  function renderCurrentGame() {
    updateStars();
    const id = state.gameId;
    $("#nextButton").dataset.ready = "";
    const stage = $("#gameStage");
    stage.innerHTML = "";
    $("#feedback").textContent = "Kamu bisa mencoba lagi kapan saja. 💛";

    if (id === "animals") renderTapCollection(animalData, "🐾", "Sentuh Hewan", "Sentuh hewannya, dengarkan suaranya!", "animal");
    else if (id === "colors") renderTapColors();
    else if (id === "fruits") renderTapCollection(fruitData, "🍎", "Buah-Buahan", "Sentuh buah untuk mengenal namanya!", "fruit");
    else if (id === "balloons") renderBalloons();
    else if (id === "matchColors") renderMatchColors();
    else if (id === "shapes") renderShapes();
    else if (id === "puzzle") renderPuzzle();
    else if (id === "collect") renderCollect();
    else if (id === "numbers") renderNumbers();
  }
  function renderTapCollection(data, icon, title, instruction, type) {
    setGameHeader(icon, title, instruction);
    const stage = $("#gameStage");
    data.forEach(item => {
      const button = document.createElement("button");
      button.className = "tap-item";
      button.innerHTML = `<span class="big-emoji">${item.emoji}</span><small>${item.name}</small>`;
      button.addEventListener("click", () => {
        button.classList.remove("pop"); void button.offsetWidth; button.classList.add("pop");
        speak(type === "animal" ? `${item.name}. ${item.sound}` : item.name);
        $("#feedback").textContent = `✨ ${item.name}!`;
        awardStar(state.gameId);
      });
      stage.appendChild(button);
    });
  }
  function renderTapColors() {
    setGameHeader("🎨", "Sentuh Warna", "Sentuh lingkaran warna yang kamu suka!");
    colorData.forEach(item => {
      const button = document.createElement("button");
      button.className = "tap-item";
      button.innerHTML = `<span class="color-dot" style="background:${item.color}"></span><small>${item.name}</small>`;
      button.addEventListener("click", () => {
        speak(item.name);
        $("#feedback").textContent = `Warna ${item.name}! Bagus!`;
        awardStar("colors");
      });
      $("#gameStage").appendChild(button);
    });
  }
  function renderBalloons() {
    setGameHeader("🎈", "Balon Ceria", "Sentuh balon yang melayang!");
    const stage = $("#gameStage");
    stage.innerHTML = `<div style="width:100%;text-align:center"><p style="font-weight:900;color:#77829a">Balon yang bisa kamu sentuh:</p><button class="balloon" id="balloonButton" aria-label="Sentuh balon">🎈</button><p id="balloonMessage" style="font-weight:900;color:#e88aa3">Ayo sentuh balonnya!</p></div>`;
    $("#balloonButton").addEventListener("click", () => {
      const balloon = $("#balloonButton");
      balloon.classList.add("pop");
      state.balloonCount++;
      speak("Pop! Hebat!");
      $("#balloonMessage").textContent = "Pop! 🎉";
      $("#feedback").textContent = "Balonnya meletus dengan lucu!";
      awardStar("balloons");
      setTimeout(() => {
        if (!$("#balloonButton")) return;
        balloon.classList.remove("pop");
        balloon.textContent = ["🎈","🎈","🎈","🎈"][state.balloonCount % 4];
        $("#balloonMessage").textContent = "Ada balon lagi! Sentuh, ya!";
      }, 500);
    });
  }
  function renderMatchColors() {
    const target = colorData[state.round % colorData.length];
    const options = shuffle([target, ...shuffle(colorData.filter(c => c !== target)).slice(0,2)]);
    setGameHeader("🖍️", "Cocokkan Warna", `Seret warna yang sama ke kotak.`);
    const stage = $("#gameStage");
    stage.innerHTML = `<div style="width:100%;text-align:center">
      <p style="font-weight:900">Warna yang dicari:</p>
      <div class="color-dot" style="background:${target.color};margin:0 auto 12px"></div>
      <div class="drop-zone" id="colorDrop" aria-label="Tempat meletakkan warna">👇</div>
      <p style="font-weight:900">Seret warna yang sama ke sini, atau sentuh pilihannya.</p>
      <div class="choice-row" id="colorChoices"></div></div>`;
    const drop = $("#colorDrop");
    let solved = false;
    function checkColor(option, button) {
      if (solved) return;
      if (option === target) {
        solved = true;
        drop.textContent = "🌟";
        drop.style.borderColor = "#8fd6a1";
        drop.style.background = "#effbf1";
        button.classList.add("correct");
        correctAnswer("matchColors");
      } else {
        wrongAnswer(button, "Belum sama. Coba warna yang lain, ya.");
      }
    }
    options.forEach(option => {
      const button = document.createElement("button");
      button.className = "choice-button";
      button.draggable = true;
      button.innerHTML = `<span class="color-dot" style="display:block;margin:auto;background:${option.color};width:65px;border-width:4px"></span><span>${option.name}</span>`;
      button.addEventListener("click", () => checkColor(option, button));
      button.addEventListener("dragstart", event => {
        event.dataTransfer.setData("text/plain", option.name);
        event.dataTransfer.effectAllowed = "move";
      });
      $("#colorChoices").appendChild(button);
    });
    drop.addEventListener("dragover", event => { event.preventDefault(); drop.style.background = "#edf8ff"; });
    drop.addEventListener("dragleave", () => { drop.style.background = "#faf9ff"; });
    drop.addEventListener("drop", event => {
      event.preventDefault();
      const chosen = event.dataTransfer.getData("text/plain");
      const option = options.find(item => item.name === chosen);
      const button = [...$("#colorChoices").children].find(el => el.textContent.includes(chosen));
      if (option && button) checkColor(option, button);
    });
  }
  function renderShapes() {
    const target = shapeData[state.round % shapeData.length];
    const options = shuffle([target, ...shuffle(shapeData.filter(s => s !== target)).slice(0,2)]);
    setGameHeader("🔺", "Cocokkan Bentuk", `Mana ${target.name.toLowerCase()}?`);
    const stage = $("#gameStage");
    stage.innerHTML = `<div style="width:100%;text-align:center"><p style="font-weight:900">Cari bentuk ini:</p><div style="font-size:100px;margin:4px">${target.emoji}</div><div class="choice-row" id="shapeChoices"></div></div>`;
    options.forEach(option => {
      const button = document.createElement("button");
      button.className = "shape-choice";
      button.textContent = option.emoji;
      button.setAttribute("aria-label", option.name);
      button.addEventListener("click", () => option === target ? correctAnswer("shapes") : wrongAnswer(button, "Belum tepat. Ayo coba lagi!"));
      $("#shapeChoices").appendChild(button);
    });
  }
  function renderPuzzle() {
    const animal = animalPuzzles[state.round % animalPuzzles.length];
    setGameHeader("🧩", "Puzzle Hewan", `Susun 4 bagian untuk membuat ${animal.name.toLowerCase()}.`);
    const stage = $("#gameStage");
    const pieces = [0,1,2,3];
    const positions = shuffle(pieces);
    stage.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;gap:22px;flex-wrap:wrap"><div><p style="text-align:center;font-weight:900">Contoh gambar</p><div style="font-size:95px;text-align:center">${animal.emoji}</div></div><div><p style="text-align:center;font-weight:900">Susun bagian</p><div class="puzzle-board" id="puzzleBoard">${pieces.map(i=>`<div class="puzzle-slot" data-slot="${i}">?</div>`).join("")}</div></div></div><div class="choice-row" id="puzzlePieces"></div>`;
    positions.forEach((piece, index) => {
      const button = document.createElement("button");
      button.className = "puzzle-piece";
      button.textContent = ["◩","◪","◧","◨"][piece];
      button.setAttribute("aria-label", `Potongan ${piece+1}`);
      button.addEventListener("click", () => {
        if (state.puzzlePlaced.includes(piece)) return;
        state.puzzlePlaced.push(piece);
        const slot = $(`[data-slot="${piece}"]`);
        slot.textContent = animal.emoji;
        slot.style.background = "#e9f8eb";
        button.disabled = true;
        button.style.opacity = ".35";
        if (state.puzzlePlaced.length === 4) correctAnswer("puzzle");
      });
      $("#puzzlePieces").appendChild(button);
    });
  }
  function renderCollect() {
    const target = fruitData[state.round % fruitData.length];
    const options = shuffle([target, ...shuffle(fruitData.filter(f => f !== target)).slice(0,3)]);
    setGameHeader("🍓", "Kumpulkan Buah", `Sentuh ${target.name.toLowerCase()}!`);
    speak(`Ayo cari ${target.name}. Sentuh ${target.name}.`);
    const stage = $("#gameStage");
    stage.innerHTML = `<div style="width:100%;text-align:center"><p style="font-weight:900">Cari buah ini: <span style="font-size:24px">${target.emoji} ${target.name}</span></p><div class="choice-row" id="fruitChoices"></div></div>`;
    options.forEach(option => {
      const button = document.createElement("button");
      button.className = "choice-button";
      button.innerHTML = `${option.emoji}<span>${option.name}</span>`;
      button.addEventListener("click", () => option === target ? correctAnswer("collect") : wrongAnswer(button, "Ayo cari buah yang disebutkan!"));
      $("#fruitChoices").appendChild(button);
    });
  }
  function renderNumbers() {
    const number = state.round % 5 + 1;
    const symbols = ["🍎","⭐","🐠","🧸","🍌"];
    setGameHeader("🔢", "Petualangan Angka", `Ada berapa ${symbols[number-1]}? Pilih angka yang benar.`);
    const stage = $("#gameStage");
    stage.innerHTML = `<div style="width:100%;text-align:center"><p style="font-weight:900">Hitung bersama, ya!</p><div class="count-items">${symbols[number-1].repeat(number)}</div><div class="choice-row" id="numberChoices"></div></div>`;
    const options = shuffle([number, ...[1,2,3,4,5].filter(n=>n!==number).sort(()=>Math.random()-.5).slice(0,2)]);
    options.forEach(option => {
      const button = document.createElement("button");
      button.className = "choice-button";
      button.textContent = option;
      button.addEventListener("click", () => option === number ? correctAnswer("numbers") : wrongAnswer(button, "Coba hitung satu per satu."));
      $("#numberChoices").appendChild(button);
    });
    speak(`Ada berapa? Hitung bersama. Satu, dua, tiga...`);
  }
  function correctAnswer(gameId) {
    $("#feedback").textContent = "🌟 " + praise[Math.floor(Math.random()*praise.length)];
    speak(praise[Math.floor(Math.random()*praise.length)]);
    awardStar(gameId);
    $("#nextButton").textContent = "Soal berikutnya ➜";
    $("#nextButton").dataset.ready = "true";
  }
  function wrongAnswer(button, message) {
    button.classList.remove("wrong"); void button.offsetWidth; button.classList.add("wrong");
    $("#feedback").textContent = "💛 " + message;
    speak(message);
  }
  function nextRound() {
    state.round++;
    $("#nextButton").dataset.ready = "";
    renderCurrentGame();
  }

  $("#homeButton").addEventListener("click", () => showScreen("homeScreen"));
  $("#backToHome").addEventListener("click", () => showScreen("homeScreen"));
  $("#backToMenu").addEventListener("click", () => { renderGameMenu(); updateStars(); showScreen("menuScreen"); });
  $("#soundButton").addEventListener("click", () => {
    state.sound = !state.sound;
    localStorage.setItem("priz-sound", state.sound ? "on" : "off");
    $("#soundButton").textContent = state.sound ? "🔊" : "🔇";
    if (!state.sound && "speechSynthesis" in window) window.speechSynthesis.cancel();
    else speak("Suara aktif.");
    toast(state.sound ? "Suara dinyalakan" : "Suara dimatikan");
  });
  $("#repeatButton").addEventListener("click", () => speak(state.currentInstruction || "Ayo bermain!"));
  $("#nextButton").addEventListener("click", () => {
    if ($("#nextButton").dataset.ready === "true" || ["animals","colors","fruits","balloons"].includes(state.gameId)) nextRound();
    else speak("Ayo coba dulu. Kamu pasti bisa!");
  });
  document.querySelectorAll("[data-profile]").forEach(button => button.addEventListener("click", () => enterProfile(button.dataset.profile)));

  $("#soundButton").textContent = state.sound ? "🔊" : "🔇";
  updateStars();
})();