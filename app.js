(() => {
  const $ = (s) => document.querySelector(s);
  const log = (m) => { $("#export-log").textContent += m + "\n"; };

  const player = $("#player");
  const overlay = $("#overlay");
  const ctx = overlay.getContext("2d");

  // Load sample video (tiny base64 placeholder)
  const sampleBase64 = "data:video/mp4;base64,AAAAHGZ0eXBtcDQyAAAAAG1wNDFpc29tYXZjMQAAAG1vb3YAAABsbXZoZAAAAAB8AAABcAAAAG1kYXQhAAABAA==";
  $("#btn-sample").onclick = () => { player.src = sampleBase64; player.play(); };
  $("#video-input").onchange = e => { player.src = URL.createObjectURL(e.target.files[0]); };

  // TTS
  $("#btn-generate-tts").onclick = () => {
    const text = $("#script").value || "Hello demo!";
    const utter = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utter);
    log("Speaking: " + text);
  };

  // Simple captions overlay
  $("#btn-generate-captions").onclick = () => {
    ctx.clearRect(0,0,overlay.width,overlay.height);
    ctx.fillStyle = "white";
    ctx.font = "24px sans-serif";
    ctx.fillText($("#script").value.split("\n")[0] || "Demo caption", 50, 50);
    log("Caption added");
  };

  // Animation with Lottie
  let anim;
  $("#btn-add-animation").onclick = () => {
    if(anim) anim.destroy();
    anim = lottie.loadAnimation({
      container: $("#lottie-container"),
      renderer:"svg", loop:true, autoplay:true,
      path:"https://assets10.lottiefiles.com/packages/lf20_zrqthn6o.json"
    });
  };
  $("#btn-clear-animation").onclick = () => { if(anim) anim.destroy(); };

  // Export (screen record)
  let rec, chunks=[];
  $("#btn-record").onclick = () => {
    const stream = overlay.captureStream(30);
    rec = new MediaRecorder(stream);
    rec.ondataavailable = e => chunks.push(e.data);
    rec.onstop = () => {
      const blob = new Blob(chunks,{type:"video/webm"});
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download="export.webm"; a.click();
      log("Exported export.webm");
    };
    rec.start();
    log("Recording started");
  };
  $("#btn-stop").onclick = () => { rec.stop(); log("Stopped recording"); };
})();
