const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const submitButton = document.getElementById('submitButton');
const downloadButton = document.getElementById('downloadButton');
const danToggle = document.getElementById('danToggle');
const danOptions = document.getElementById('danOptions');
const form = document.getElementById('inputForm');
const loadingModal = document.getElementById('loadingModal');

const CANVAS_WIDTH = 556;
const CANVAS_HEIGHT = 117;
const TITLE_MAX_FONT = 22;
const TITLE_MIN_FONT = 14;
const TITLE_MAX_WIDTH = 440;
const PLAYER_NAME_FONT = 25;

const FONT_DATAS = [
  ["FOT", "./fonts/fot.otf"],
  ["GW", "./fonts/GW.ttf"],
  ["Kukde", "./fonts/Kukde.otf"],
  ["Russia", "./fonts/EBG.ttf"]
];

let isImageDrawn = false;
let isFontLoaded = false;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
submitButton.disabled = true;
downloadButton.disabled = true;
loadingModal.style.display = 'flex'; // モーダル表示

const loadFonts = Promise.all(
  FONT_DATAS.map(([name, path]) =>
    new FontFace(name, `url('${path}')`).load().then(f => document.fonts.add(f))
  )
);

const minDelay = new Promise(resolve => setTimeout(resolve, 2000));

Promise.all([loadFonts, minDelay])
  .then(() => {
    isFontLoaded = true;
    submitButton.disabled = false;
    loadingModal.style.display = 'none';
  })
  .catch(() => {
    loadingModal.style.display = 'none';
    alert('フォントの読み込みに失敗しました');
  });



// 段位トグル
danToggle.addEventListener('change', () => {
  danOptions.style.display = danToggle.checked ? 'block' : 'none';
  if (isFontLoaded) debounceDraw();
});

// debounce関数
function debounce(func, wait = 100) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

const debounceDraw = debounce(() => {
  if (isFontLoaded) drawPlate();
}, 100);

['title', 'name', 'type', 'danLevel', 'frameColor', 'passColor'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', debounceDraw);
});

// submitボタンは押しても描画（必要なら残す）
form.addEventListener('submit', e => {
  e.preventDefault();
  if (isFontLoaded) drawPlate();
});

// ダウンロードボタン
downloadButton.addEventListener('click', handleDownload);

// 描画処理
function drawPlate() {
  const title = document.getElementById('title').value.trim();
  const name = document.getElementById('name').value.trim();
  const type = document.getElementById('type').value;
  const showDan = danToggle.checked;

  if (!title || !name) {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    downloadButton.disabled = true;
    return;
  }

  const platePath = showDan
    ? `./images/plate/dan/${type}.png`
    : `./images/plate/no-dan/${type}.png`;

  const plateImage = new Image();
  plateImage.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(plateImage, 0, CANVAS_HEIGHT - plateImage.height, CANVAS_WIDTH, plateImage.height);

    drawTitle(title);
    drawPlayerName(name, showDan);

    if (showDan) {
      drawDanImage();
    } else {
      enableDownload();
    }
  };
  plateImage.onerror = () => handleError('プレート画像の読み込みに失敗しました');
  plateImage.src = platePath;
}

function drawTitle(title) {
  let fontSize = TITLE_MAX_FONT;
  ctx.font = `${fontSize}px ${getFontStack()}`;

  while (ctx.measureText(title).width > TITLE_MAX_WIDTH && fontSize > TITLE_MIN_FONT) {
    fontSize--;
    ctx.font = `${fontSize}px ${getFontStack()}`;
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#000";
  ctx.fillText(title, CANVAS_WIDTH / 2, 50);
  ctx.miterLimit = 1;
}

function drawPlayerName(name, showDan) {
  ctx.font = `${PLAYER_NAME_FONT}px ${getFontStack()}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#000';
  ctx.fillStyle = '#fff';
  ctx.miterLimit = 1;

  const textWidth = ctx.measureText(name).width;
  const y = 91.5;
  let x = showDan ? CANVAS_WIDTH * 0.26 : CANVAS_WIDTH / 2;

  if (showDan) {
    const maxWidth = CANVAS_WIDTH / 2 - 20;
    if (textWidth > maxWidth) x -= (textWidth - maxWidth) / 2;
  }

  ctx.strokeText(name, x, y);
  ctx.fillText(name, x, y);
}

function drawDanImage() {
  const danLevel = document.getElementById('danLevel').value;
  const frameColor = document.getElementById('frameColor').value;
  const passColor = document.getElementById('passColor').value;

  const danImage = new Image();
  danImage.onload = () => {
    const scale = 0.85;
    const w = danImage.width * scale;
    const h = danImage.height * scale;
    const x = CANVAS_WIDTH - w - 100;
    const y = CANVAS_HEIGHT - h - 7.5;
    ctx.drawImage(danImage, x, y, w, h);
    enableDownload();
  };
  danImage.onerror = () =>
    handleError('この段位表示は素材がありません。見つかり次第追加します🙇‍♀️');
  danImage.src = `./images/dani/${danLevel}/${frameColor}-${passColor}.png`;
}

// ユーティリティ関数
function getFontStack() {
  return FONT_DATAS.map(([name]) => `'${name}'`).join(', ');
}

function enableDownload() {
  isImageDrawn = true;
  downloadButton.disabled = false;
}

function handleError(msg) {
  alert(msg);
  isImageDrawn = false;
  downloadButton.disabled = true;
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function handleDownload() {
  if (!isImageDrawn) return alert('称号が生成されていません');
  try {
    const link = document.createElement('a');
    link.download = 'nameplate.png';
    link.href = canvas.toDataURL();
    link.click();
  } catch (e) {
    alert('画像のダウンロードに失敗しました');
    console.error('ダウンロード失敗:', e);
  }
}