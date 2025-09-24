const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const submitButton = document.getElementById('submitButton');
const downloadButton = document.getElementById('downloadButton');
const danToggle = document.getElementById('danToggle');
const danOptions = document.getElementById('danOptions');
const form = document.getElementById('inputForm');

const CANVAS_WIDTH = 556;
const CANVAS_HEIGHT = 117;
const TITLE_MAX_FONT = 25;
const TITLE_MIN_FONT = 14;
const TITLE_MAX_WIDTH = 440; // クリア/フルコン/全良称号のおにマークに被らないくらいの範囲で指定してる
const PLAYER_NAME_FONT = 25;

const FONT_DATAS = [
  ["FOT", "./fonts/fot.otf"], // AC版(ニジイロ)のフォント
  ["GW", "./fonts/GW.ttf"], // 中国語フォント(繁体字の場合はHK.ttfのほうがACに近い)
  ["Kukde", "./fonts/Kukde.otf"], // 韓国語フォント
  ["Russia", "./fonts/EBG.ttf"] // ロシア語フォント
];

let isImageDrawn = false;
let isFontLoaded = false;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
submitButton.disabled = true;
downloadButton.disabled = true;

// フォントの読み込み
Promise.all(
  FONT_DATAS.map(([name, path]) =>
    new FontFace(name, `url('${path}')`).load().then(f => document.fonts.add(f))
  )
).then(() => {
  isFontLoaded = true;
  submitButton.disabled = false;
});

// イベント
danToggle.addEventListener('change', () => {
  danOptions.style.display = danToggle.checked ? 'block' : 'none';
});

form.addEventListener('submit', e => {
  e.preventDefault();
  if (!isFontLoaded) return alert('フォント読込中です。少々お待ちください');
  drawPlate();
});

downloadButton.addEventListener('click', handleDownload);

function detectFont(text) {
  const hiraganaRegex = /[\u3040-\u309F]/;
  const katakanaRegex = /[\u30A0-\u30FF]/;
  const kanjiRegex = /[\u4E00-\u9FFF]/;

  if (hiraganaRegex.test(text) || katakanaRegex.test(text)) {
    return "FOT";
  }

  if (kanjiRegex.test(text)) {
    return "GW";
  }

  return "FOT";
}

// 描画処理
function drawPlate() {
  const title = document.getElementById('title').value.trim();
  const name = document.getElementById('name').value.trim();
  const type = document.getElementById('type').value;
  const showDan = danToggle.checked;

  if (!title) return alert('称号名を入力してください');
  if (!name) return alert('プレイヤー名を入力してください');

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
  ctx.font = `${fontSize}px '${detectFont(title)}'`;

  // 既定値におさまるように自動縮小
  while (ctx.measureText(title).width > TITLE_MAX_WIDTH && fontSize > TITLE_MIN_FONT) {
    fontSize--;
    ctx.font = `${fontSize}px '${detectFont(title)}'`;
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#000";
  ctx.fillText(title, CANVAS_WIDTH / 2, 50);
  ctx.miterLimit = 1;
}

function drawPlayerName(name, showDan) {
  ctx.font = `${PLAYER_NAME_FONT}px '${detectFont(name)}'`;
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
