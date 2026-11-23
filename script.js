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
      { id:"numbers", title:"Petualangan Angka", icon:"🔢", desc:"Belajar menghitung 1–5" },
      { id:"alphabet", title:"Ayo Membaca Alfabet", icon:"🔤", desc:"Kenali huruf A sampai Z" },
      { id:"harakat", title:"Belajar Harakat Arab", icon:"🕌", desc:"Mengenal fathah, kasrah, dammah" },
      { id:"duas", title:"Doa-Doa Pendek", icon:"🤲", desc:"Belajar doa sehari-hari" }
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
  const harakatData = [
    {name:"Fathah", mark:"بَ", sound:"ba", desc:"Bunyi a"}, {name:"Kasrah", mark:"بِ", sound:"bi", desc:"Bunyi i"},
    {name:"Dammah", mark:"بُ", sound:"bu", desc:"Bunyi u"}, {name:"Fathatain", mark:"بً", sound:"ban", desc:"Bunyi an"},
    {name:"Kasratain", mark:"بٍ", sound:"bin", desc:"Bunyi in"}, {name:"Dammatain", mark:"بٌ", sound:"bun", desc:"Bunyi un"},
    {name:"Sukun", mark:"بْ", sound:"b", desc:"Huruf mati"}, {name:"Tasydid", mark:"بّ", sound:"bba", desc:"Huruf rangkap"}
  ];
  const duaData = [
    {title:"Doa sebelum makan", arabic:"بِسْمِ اللَّهِ", latin:"Bismillaah", meaning:"Dengan nama Allah."},
    {title:"Doa sesudah makan", arabic:"الْحَمْدُ لِلَّهِ", latin:"Alhamdulillaah", meaning:"Segala puji bagi Allah."},
    {title:"Doa sebelum tidur", arabic:"بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", latin:"Bismika Allahumma amuutu wa ahyaa", meaning:"Dengan nama-Mu ya Allah, aku mati dan aku hidup."},
    {title:"Doa bangun tidur", arabic:"الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا", latin:"Alhamdulillaahil-ladzii ahyaanaa ba’da maa amaatanaa", meaning:"Segala puji bagi Allah yang menghidupkan kami setelah mematikan kami."}
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
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => /^id(-|_)/i.test(v.lang)) || voices.find(v => /indonesia/i.test(v.name));
      if (voice) utterance.voice = voice;
      utterance.lang = voice?.lang || "id-ID";
      utterance.rate = 0.96;
      utterance.pitch = 1.02;
      utterance.volume = 1;
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
    const max = games[state.profile].length;
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
    else if (id === "alphabet") renderAlphabet();
    else if (id === "harakat") renderHarakat();
    else if (id === "duas") renderDuas();
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
    setGameHeader("🧩", "Puzzle Hewan", `Pilih potongan, lalu letakkan pada kotak yang cocok untuk menyusun ${animal.name.toLowerCase()}.`);
    const stage = $("#gameStage"), positions = shuffle([0,1,2,3]);
    state.puzzlePlaced = []; state.selectedPuzzle = null;
    stage.innerHTML = `<div class="puzzle-wrap"><div class="puzzle-reference"><p>Contoh gambar</p><span>${animal.emoji}</span><strong>${animal.name}</strong></div><div><p class="puzzle-label">Papan puzzle</p><div class="puzzle-board" id="puzzleBoard">${[0,1,2,3].map(i=>`<button class="puzzle-slot" data-slot="${i}">?</button>`).join("")}</div></div></div><p class="puzzle-help">Sentuh satu potongan, kemudian sentuh kotak yang sesuai.</p><div class="puzzle-pieces" id="puzzlePieces">${positions.map(piece=>`<button class="puzzle-piece" data-piece="${piece}"><span class="puzzle-fragment fragment-${piece}">${animal.emoji}</span></button>`).join("")}</div>`;
    stage.querySelectorAll("[data-piece]").forEach(button=>button.addEventListener("click",()=>{
      if(state.puzzlePlaced.includes(Number(button.dataset.piece))) return;
      stage.querySelectorAll("[data-piece]").forEach(b=>b.classList.remove("selected")); button.classList.add("selected"); state.selectedPuzzle=Number(button.dataset.piece); speak("Potongan dipilih. Sekarang cari kotak yang cocok.");
    }));
    stage.querySelectorAll("[data-slot]").forEach(slot=>slot.addEventListener("click",()=>{
      const piece=state.selectedPuzzle;
      if(piece===null || piece===undefined || state.puzzlePlaced.includes(piece)){toast("Pilih potongan puzzle dulu, ya.");return;}
      if(piece!==Number(slot.dataset.slot)){slot.classList.add("nudge");setTimeout(()=>slot.classList.remove("nudge"),300);speak("Belum cocok. Coba kotak yang lain, ya.");return;}
      slot.innerHTML=`<span class="puzzle-fragment fragment-${piece}">${animal.emoji}</span>`;slot.classList.add("filled");
      const pieceButton=stage.querySelector(`[data-piece="${piece}"]`);pieceButton.disabled=true;pieceButton.classList.add("placed");state.puzzlePlaced.push(piece);state.selectedPuzzle=null;
      if(state.puzzlePlaced.length===4) correctAnswer("puzzle"); else {$("#feedback").textContent=`Bagus! ${state.puzzlePlaced.length} dari 4 potongan sudah tepat.`;speak("Bagus! Satu potongan sudah tepat.");}
    }));
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
  function renderAlphabet() {
    const letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), target=letters[state.round%26], options=shuffle([target,...shuffle(letters.filter(x=>x!==target)).slice(0,2)]);
    setGameHeader("🔤","Ayo Membaca Alfabet",`Ayo cari huruf ${target}.`);
    $("#gameStage").innerHTML=`<div class="learning-card"><p>Huruf yang dicari</p><div class="learning-big-letter">${target}</div><p>Sentuh huruf yang sama di bawah ini.</p><div class="choice-row" id="alphabetChoices"></div></div>`;
    options.forEach(letter=>{const b=document.createElement("button");b.className="choice-button alphabet-choice";b.textContent=letter;b.addEventListener("click",()=>letter===target?correctAnswer("alphabet"):wrongAnswer(b,"Belum tepat. Yuk coba lagi."));$("#alphabetChoices").appendChild(b);});
    speak(`Ini huruf ${target}. Ayo cari huruf ${target}.`);
  }
  function renderHarakat() {
    const item=harakatData[state.round%harakatData.length], options=shuffle([item,...shuffle(harakatData.filter(x=>x!==item)).slice(0,2)]);
    setGameHeader("🕌","Belajar Harakat Arab",`Kenali ${item.name}.`);
    $("#gameStage").innerHTML=`<div class="learning-card"><p>Harakat yang sedang dipelajari</p><div class="arabic-letter" lang="ar" dir="rtl">${item.mark}</div><h2>${item.name}</h2><p>${item.desc}</p><div class="choice-row" id="harakatChoices"></div></div>`;
    options.forEach(option=>{const b=document.createElement("button");b.className="choice-button";b.innerHTML=`<span class="arabic-option" lang="ar" dir="rtl">${option.mark}</span><small>${option.name}</small>`;b.addEventListener("click",()=>option===item?correctAnswer("harakat"):wrongAnswer(b,"Ayo perhatikan tanda harakatnya."));$("#harakatChoices").appendChild(b);});
    speak(`${item.name}. Bunyi ${item.sound}. ${item.desc}.`);
  }
  function renderDuas() {
    const dua=duaData[state.round%duaData.length];setGameHeader("🤲","Doa-Doa Pendek","Dengarkan dan ikuti doa pendek berikut.");
    $("#gameStage").innerHTML=`<div class="learning-card dua-card"><p class="dua-title">${dua.title}</p><div class="dua-arabic" lang="ar" dir="rtl">${dua.arabic}</div><p class="dua-latin">${dua.latin}</p><p class="dua-meaning">${dua.meaning}</p><button class="secondary-button" id="repeatDua">🔊 Dengarkan lagi</button><button class="primary-button" id="duaDone">Saya sudah belajar ✓</button></div>`;
    const say=()=>speak(`${dua.title}. ${dua.latin}. Artinya, ${dua.meaning}`);$("#repeatDua").addEventListener("click",say);$("#duaDone").addEventListener("click",()=>correctAnswer("duas"));say();
  }
  function correctAnswer(gameId) {
    if ($("#nextButton").dataset.ready === "true") return;
    const congrats = ["Selamat! Misinya berhasil diselesaikan!", "Yeay! Kamu hebat, misinya selesai!", "Alhamdulillah, berhasil! Ayo lanjut petualangan!"][Math.floor(Math.random()*3)];
    $("#feedback").textContent = "🎉 " + congrats + " ⭐";
    speak(congrats);
    toast("🎉 Selamat! Misi berhasil diselesaikan!");
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