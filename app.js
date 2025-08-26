(() => {
  // ===== Google OAuth =====
  const CLIENT_ID = "771386694310-6sohguu83pcdsteqbq669mch1keegvp3.apps.googleusercontent.com";
  const SCOPES = "https://www.googleapis.com/auth/drive.file";

  function authenticate() {
    return gapi.auth2.getAuthInstance()
      .signIn({ scope: SCOPES })
      .then(() => console.log("Sign-in successful"))
      .catch(err => console.error("Error signing in", err));
  }

  function loadClient() {
    gapi.client.setApiKey(""); // optional if you set API key
    return gapi.client.load("https://content.googleapis.com/discovery/v1/apis/drive/v3/rest")
      .then(() => console.log("GAPI client loaded for API"))
      .catch(err => console.error("Error loading GAPI client", err));
  }

  window.initGoogleAPI = function () {
    gapi.load("client:auth2", () => {
      gapi.auth2.init({ client_id: CLIENT_ID });
    });
  };

  // Example: Upload file to Drive
  async function uploadFile(blob) {
    const metadata = {
      name: "exported-video.webm",
      mimeType: "video/webm"
    };

    const form = new FormData();
    form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    form.append("file", blob);

    const token = gapi.auth.getToken().access_token;
    const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      headers: new Headers({ "Authorization": "Bearer " + token }),
      body: form
    });
    const file = await res.json();
    console.log("Uploaded File Id:", file.id);
    alert("Video uploaded to Google Drive ✅");
  }

  // ===== Existing Code =====
  const $ = (s) => document.querySelector(s);
  const log = (m) => { $("#export-log").textContent += m + "\n"; };

  const player = $("#player");
  const overlay = $("#overlay");
  const ctx = overlay.getContext("2d");

  // Load sample video
  const sampleBase64 = "data:video/mp4;base64,AAAAHGZ0eXBtcDQyAAAAAGl...";
  $("#btn-sample").onclick = () => { player.src = sampleBase64; player.play(); };
  $("#video-input").onchange = e => { player.src = URL.createObjectURL(e.target.files[0]); };

  // TTS
  $("#btn-generate-tts").onclick = () => {
    const text = $("#script").value || "Hello demo!";
    const utter = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utter);
    log("Speaking: " + text);
  };

  // Captions
  $("#btn-generate-captions").onclick = () => {
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    ctx.fillStyle = "white";
    ctx.font = "24px sans-serif";
    ctx.fillText($("#script").value.split("\n")[0] || "Demo caption", 50, 50);
    log("Caption added");
  };

  // Animation
  let anim;
  $("#btn-add-animation").onclick = () => {
    if (anim) anim.destroy();
    anim = lottie.loadAnimation({
      container: document.getElementById("lottie-container"),
      renderer: "svg", loop: true, autoplay: true,
      path: "https://assets10.lottiefiles.com/packages/lf20_zrqthn60.json"
    });
  };
  $("#btn-clear-animation").onclick = () => { if (anim) anim.destroy(); };

  // Recording + Upload to Drive
  let rec, chunks = [];
  $("#btn-record").onclick = () => {
    chunks = [];
    const stream = overlay.captureStream(30);
    rec = new MediaRecorder(stream);
    rec.ondataavailable = e => chunks.push(e.data);
    rec.onstop = async () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      log("Exported export.webm");
      uploadFile(blob); // Upload to Google Drive here
    };
    rec.start();
    log("Recording started");
  };
  $("#btn-stop").onclick = () => { rec.stop(); log("Stopped recording"); };

})();
