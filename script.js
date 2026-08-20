const menuToggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('.nav');
menuToggle?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuToggle.setAttribute('aria-expanded',open)});
document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

const revealObserver=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');revealObserver.unobserve(e.target)}})},{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

const sections=[...document.querySelectorAll('main section[id]')];
const links=[...document.querySelectorAll('.nav a')];
const activeObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){const l=links.find(x=>x.getAttribute('href')==='#'+e.target.id);links.forEach(x=>x.classList.remove('active'));l?.classList.add('active')}}),{rootMargin:'-30% 0px -55% 0px'});
sections.forEach(s=>activeObserver.observe(s));

const modal=document.getElementById('thesisModal');
document.getElementById('openThesis')?.addEventListener('click',()=>{modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'});
document.querySelectorAll('[data-close-modal]').forEach(x=>x.addEventListener('click',()=>{modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow=''}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){modal?.classList.remove('open');document.body.style.overflow=''}});

const toast=document.getElementById('toast');
const CA='Dveq2rabHNdZW1YR5ZSECSnPkrcV5ZVGjKSMXD6Bpump';

document.getElementById('copyContract')?.addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(CA);toast.textContent='Contract copied!';}
  catch{toast.textContent='Copy unavailable'}
  toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1800);
});

const art=document.querySelector('.hero-art img');
window.addEventListener('mousemove',e=>{if(!art||innerWidth<900)return;const x=(e.clientX/innerWidth-.5)*8,y=(e.clientY/innerHeight-.5)*5;art.style.transform=`translate(${x}px,${y}px) scale(1.02)`});

const audio=document.getElementById('ambientAudio');
if (audio) {
  audio.src = 'audio/ambient.mp3';
}
const audioWidget=document.getElementById('audioWidget');
const audioToggle=document.getElementById('audioToggle');
const audioStatus=document.getElementById('audioStatus');
audioToggle?.addEventListener('click',async()=>{
  if(!audio.src){
    audioStatus.textContent='ADD AUDIO';
    toast.textContent='Add audio/ambient.mp3 to enable sound';
    toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2200);
    return;
  }
  if(audio.paused){await audio.play();audioWidget.classList.add('playing');audioStatus.textContent='ON'}
  else{audio.pause();audioWidget.classList.remove('playing');audioStatus.textContent='OFF'}
});

function formatNum(num){
  if(num>=1e6)return (num/1e6).toFixed(2)+'M';
  if(num>=1e3)return (num/1e3).toFixed(1)+'K';
  return num.toFixed(2);
}

async function fetchDexData(){
  try{
    const res=await fetch(`https://api.dexscreener.com/latest/dex/tokens/${CA}`);
    if(!res.ok)return;
    const data=await res.json();
    if(data.pairs&&data.pairs.length>0){
      const pair=data.pairs[0];
      const price=parseFloat(pair.priceUsd);
      const priceChange=pair.priceChange?.h24;
      const mcap=pair.fdv||pair.marketCap;
      const liq=pair.liquidity?.usd;
      const vol=pair.volume?.h24;

      const livePriceEl=document.getElementById('livePrice');
      const liveChangeEl=document.getElementById('livePriceChange');
      const statMcapEl=document.getElementById('statMcap');
      const statLiquidityEl=document.getElementById('statLiquidity');
      const statVolumeEl=document.getElementById('statVolume');

      if(price&&livePriceEl){
        livePriceEl.textContent=price<0.0001?'$'+price.toFixed(8):'$'+price.toFixed(4);
      }
      if(priceChange!==undefined&&liveChangeEl){
        const isPos=priceChange>=0;
        liveChangeEl.textContent=(isPos?'+':'')+priceChange.toFixed(2)+'%';
        liveChangeEl.className=isPos?'positive':'negative';
      }
      if(mcap&&statMcapEl){
        statMcapEl.textContent='$'+formatNum(mcap);
      }
      if(liq&&statLiquidityEl){
        statLiquidityEl.textContent='$'+formatNum(liq);
      }
      if(vol&&statVolumeEl){
        statVolumeEl.textContent='$'+formatNum(vol);
      }
    }
  }catch(err){
    console.log('DexScreener Live Fetch:',err);
  }
}

fetchDexData();
setInterval(fetchDexData,25000);

// ==========================================
// MEME GENERATOR LOGIC
// ==========================================

const canvas = document.getElementById('memeCanvas');
const ctx = canvas?.getContext('2d');
const topTextInput = document.getElementById('topTextInput');
const bottomTextInput = document.getElementById('bottomTextInput');
const fontSizeInput = document.getElementById('fontSizeInput');
const fontSizeVal = document.getElementById('fontSizeVal');
const strokeSizeInput = document.getElementById('strokeSizeInput');
const strokeSizeVal = document.getElementById('strokeSizeVal');
const watermarkToggle = document.getElementById('watermarkToggle');
const downloadBtn = document.getElementById('downloadMemeBtn');
const shareTwitterBtn = document.getElementById('shareTwitterBtn');
const fileInput = document.getElementById('memeUpload');
const templateThumbs = document.querySelectorAll('.template-thumb');

let currentImage = new Image();
let watermarkImage = new Image();
watermarkImage.src = 'logo.jpg';

// Text state
let text1 = {
  text: topTextInput ? topTextInput.value : '',
  x: 400,
  y: 80,
  isDragging: false
};
let text2 = {
  text: bottomTextInput ? bottomTextInput.value : '',
  x: 400,
  y: 720,
  isDragging: false
};

let activeDragText = null;
let dragStartX = 0;
let dragStartY = 0;

// Load first template initially
if (canvas && ctx) {
  currentImage.src = 'meme1.jpg';
  currentImage.onload = () => {
    drawMeme();
  };
}

// Draw function
function drawMeme() {
  if (!ctx || !canvas) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background image scaled proportionally to fit 800x800 canvas
  if (currentImage.complete && currentImage.naturalWidth > 0) {
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imgWidth = currentImage.width;
    const imgHeight = currentImage.height;

    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth, drawHeight, drawX, drawY;

    if (imgRatio > canvasRatio) {
      // Image is wider than canvas
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imgRatio;
      drawX = 0;
      drawY = (canvasHeight - drawHeight) / 2;
    } else {
      // Image is taller than canvas
      drawHeight = canvasHeight;
      drawWidth = canvasHeight * imgRatio;
      drawX = (canvasWidth - drawWidth) / 2;
      drawY = 0;
    }

    ctx.drawImage(currentImage, drawX, drawY, drawWidth, drawHeight);
  } else {
    // Solid background if not loaded
    ctx.fillStyle = '#080711';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Draw watermark if checked
  if (watermarkToggle && watermarkToggle.checked && watermarkImage.complete && watermarkImage.naturalWidth > 0) {
    const wmSize = 70;
    const wmX = canvas.width - wmSize - 20;
    const wmY = canvas.height - wmSize - 20;

    // Draw circular backdrop for watermark logo
    ctx.save();
    ctx.beginPath();
    ctx.arc(wmX + wmSize/2, wmY + wmSize/2, wmSize/2 + 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(5, 4, 10, 0.8)';
    ctx.strokeStyle = '#b76bff';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    // Clip circular logo
    ctx.beginPath();
    ctx.arc(wmX + wmSize/2, wmY + wmSize/2, wmSize/2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(watermarkImage, wmX, wmY, wmSize, wmSize);
    ctx.restore();

    // Draw small text label underneath or next to watermark
    ctx.fillStyle = '#4dffc8';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 4;
    ctx.fillText('$COURAGE', wmX - 10, wmY + wmSize/2 + 4);
    ctx.shadowBlur = 0; // Reset shadow
  }

  // Font adjustments
  const fontSize = fontSizeInput ? parseInt(fontSizeInput.value) : 50;
  const strokeSize = strokeSizeInput ? parseInt(strokeSizeInput.value) : 6;

  ctx.font = `${fontSize}px Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = strokeSize;
  ctx.lineJoin = 'miter';

  // Draw Top Text
  drawWrappedText(text1.text, text1.x, text1.y, canvas.width - 60, fontSize);

  // Draw Bottom Text
  drawWrappedText(text2.text, text2.x, text2.y, canvas.width - 60, fontSize);

  updateShareUrl();
}

// Wrap text utility to render multi-line meme text nicely
function drawWrappedText(text, x, y, maxWidth, fontSize) {
  const words = text.toUpperCase().split(' ');
  const lines = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine + (currentLine ? ' ' : '') + words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine);

  // Draw all lines, centered vertically around y
  const totalHeight = lines.length * fontSize * 1.1;
  const startY = y - (totalHeight / 2) + (fontSize / 2);

  lines.forEach((line, index) => {
    const lineY = startY + (index * fontSize * 1.1);
    if (ctx.lineWidth > 0) {
      ctx.strokeText(line, x, lineY);
    }
    ctx.fillText(line, x, lineY);
  });
}

// Event Listeners for controls
topTextInput?.addEventListener('input', (e) => {
  text1.text = e.target.value;
  drawMeme();
});

bottomTextInput?.addEventListener('input', (e) => {
  text2.text = e.target.value;
  drawMeme();
});

fontSizeInput?.addEventListener('input', (e) => {
  if (fontSizeVal) fontSizeVal.textContent = e.target.value;
  drawMeme();
});

strokeSizeInput?.addEventListener('input', (e) => {
  if (strokeSizeVal) strokeSizeVal.textContent = e.target.value;
  drawMeme();
});

watermarkToggle?.addEventListener('change', () => {
  drawMeme();
});

// Preset Template selector
templateThumbs.forEach(thumb => {
  thumb.addEventListener('click', () => {
    templateThumbs.forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
    
    const src = thumb.getAttribute('data-src');
    if (src) {
      currentImage = new Image();
      currentImage.src = src;
      currentImage.onload = () => {
        // Reset text positions when template changes to avoid them going off-screen
        text1.x = canvas.width / 2;
        text1.y = 80;
        text2.x = canvas.width / 2;
        text2.y = canvas.height - 80;
        drawMeme();
      };
    }
  });
});

// File Upload Handler
fileInput?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    currentImage = new Image();
    currentImage.src = event.target.result;
    currentImage.onload = () => {
      // Remove active states from preset buttons
      templateThumbs.forEach(t => t.classList.remove('active'));
      // Reset text coordinates
      text1.x = canvas.width / 2;
      text1.y = 80;
      text2.x = canvas.width / 2;
      text2.y = canvas.height - 80;
      drawMeme();
    };
  };
  reader.readAsDataURL(file);
});

// Drag and drop text coordinates positioning on canvas
function getMousePos(canvasDom, clientX, clientY) {
  const rect = canvasDom.getBoundingClientRect();
  const scaleX = canvasDom.width / rect.width;
  const scaleY = canvasDom.height / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}

function isMouseOverText(pos, textObj) {
  const dx = pos.x - textObj.x;
  const dy = pos.y - textObj.y;
  return (dx * dx + dy * dy) < 7000; // ~83px distance threshold
}

function handleStart(clientX, clientY) {
  if (!canvas) return;
  const pos = getMousePos(canvas, clientX, clientY);
  
  if (isMouseOverText(pos, text1)) {
    activeDragText = text1;
    dragStartX = pos.x - text1.x;
    dragStartY = pos.y - text1.y;
    canvas.style.cursor = 'grabbing';
  } else if (isMouseOverText(pos, text2)) {
    activeDragText = text2;
    dragStartX = pos.x - text2.x;
    dragStartY = pos.y - text2.y;
    canvas.style.cursor = 'grabbing';
  }
}

function handleMove(clientX, clientY) {
  if (!canvas) return;
  const pos = getMousePos(canvas, clientX, clientY);

  if (activeDragText) {
    activeDragText.x = Math.max(20, Math.min(canvas.width - 20, pos.x - dragStartX));
    activeDragText.y = Math.max(20, Math.min(canvas.height - 20, pos.y - dragStartY));
    drawMeme();
  } else {
    // Hover cursor feedback
    if (isMouseOverText(pos, text1) || isMouseOverText(pos, text2)) {
      canvas.style.cursor = 'grab';
    } else {
      canvas.style.cursor = 'default';
    }
  }
}

function handleEnd() {
  if (!canvas) return;
  activeDragText = null;
  canvas.style.cursor = 'default';
}

// Mouse events
canvas?.addEventListener('mousedown', (e) => {
  handleStart(e.clientX, e.clientY);
});

window.addEventListener('mousemove', (e) => {
  handleMove(e.clientX, e.clientY);
});

window.addEventListener('mouseup', () => {
  handleEnd();
});

// Touch events for mobile compatibility
canvas?.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    // Prevent scrolling when dragging text on canvas
    e.preventDefault();
    handleStart(e.touches[0].clientX, e.touches[0].clientY);
  }
}, { passive: false });

window.addEventListener('touchmove', (e) => {
  if (activeDragText && e.touches.length === 1) {
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  }
});

window.addEventListener('touchend', () => {
  handleEnd();
});

// Download Meme Action
downloadBtn?.addEventListener('click', () => {
  if (!canvas) return;
  
  const link = document.createElement('a');
  link.download = 'courage_meme.png';
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = 'Meme downloaded!';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }
});

// Share on Twitter Action
function updateShareUrl() {
  if (!shareTwitterBtn) return;
  
  const textVal = `Just cooked a fresh meme in the $COURAGE Meme Lab! 🦁💎\n\nCA: Dveq2rabHNdZW1YR5ZSECSnPkrcV5ZVGjKSMXD6Bpump\n\n#Solana #COURAGE @CourageSolana`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(textVal)}`;
  shareTwitterBtn.href = twitterUrl;
}

// ==========================================
// CINEMATIC PRELOADER LOGIC
// ==========================================

(function() {
  const preloader = document.getElementById('preloader');
  const preloaderBar = document.getElementById('preloaderBar');
  const preloaderPercent = document.getElementById('preloaderPercent');

  if (!preloader) return;

  // Lock scroll during preloader
  document.body.style.overflow = 'hidden';

  let progress = 0;
  let isWindowLoaded = false;

  // Update progress bar helper
  function updateProgress(value) {
    if (preloaderBar) preloaderBar.style.width = value + '%';
    if (preloaderPercent) preloaderPercent.textContent = Math.round(value) + '%';
  }

  // Smooth loading simulation (interpolates toward target)
  const loadInterval = setInterval(() => {
    if (!isWindowLoaded) {
      // Slow down as we approach 90%
      if (progress < 90) {
        progress += (90 - progress) * 0.05 + 0.5;
      }
    } else {
      // Speed up to 100% when load finishes
      progress += (100 - progress) * 0.2 + 2;
    }

    if (progress >= 100) {
      progress = 100;
      clearInterval(loadInterval);
      dismissPreloader();
    }

    updateProgress(progress);
  }, 20);

  // When all assets are fully fetched
  window.addEventListener('load', () => {
    isWindowLoaded = true;
  });

  // Hides the preloader with premium ease-out transitions
  function dismissPreloader() {
    setTimeout(() => {
      preloader.classList.add('fade-out');
      // Unlock body scroll
      document.body.style.overflow = '';
      
      // Fully remove from DOM tree after transitions finish (0.8s) for cleanup
      setTimeout(() => {
        preloader.remove();
      }, 800);
    }, 200); // Small visual holding time at 100%
  }

  // Fallback: Dismiss after 8 seconds in case window load event fails to fire
  setTimeout(() => {
    if (!isWindowLoaded) {
      isWindowLoaded = true;
    }
  }, 8000);
})();



