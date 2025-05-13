const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const submitButton = document.getElementById('submitButton');
const downloadButton = document.getElementById('downloadButton');
const danToggle = document.getElementById('danToggle');
const danOptions = document.getElementById('danOptions');

let isImageDrawn = false;
let isFontLoaded = false;

submitButton.disabled = true;
downloadButton.disabled = true;

/**
 * @typedef {[name: string, url: string]} FontData
 * @type {FontData[]}
 */
const fontDatas = [["TnT", "./fonts/TnT.ttf"], ["Kukde", "./fonts/Kukde.otf"]];
Promise.all(fontDatas.map((fontData) => new FontFace(fontData[0], `url('${fontData[1]}')`)
  .load()
  .then((loadedFont) => document.fonts.add(loadedFont))))
  .then(() => {
    isFontLoaded = true;
    submitButton.disabled = false;
  });

danToggle.addEventListener('change', () => {
  danOptions.style.display = danToggle.checked ? 'block' : 'none';
});

document.getElementById('inputForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!isFontLoaded) {
    alert('フォントを読込中です。少しお待ちください');
    return;
  }
  draw();
});

function draw() {
  const title = document.getElementById('title').value.trim();
  const name = document.getElementById('name').value.trim();
  const showDan = danToggle.checked;
  const type = document.getElementById('type').value;

  if (!title) return alert('称号名を入力してください');
  if (!name) return alert('プレイヤー名を入力してください');

  const platePath = showDan
    ? `./images/plate/dan/${type}.png`
    : `./images/plate/no-dan/${type}.png`;

  const plateImage = new Image();
  plateImage.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.height = 117;

    const y = canvas.height - plateImage.height;
    ctx.drawImage(plateImage, 0, y, canvas.width, plateImage.height);

    let titleFontSize = title.length > 23 ? 14 : 20;
    ctx.font = `${titleFontSize}px ${fontDatas.map(e => `'${e[0]}'`).join(', ')}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';

    const letterSpacing = 1;
    let titleWidth = [...title].reduce((acc, char) => acc + ctx.measureText(char).width + letterSpacing, 0);
    let titleX = (canvas.width - titleWidth + letterSpacing) / 2;
    const titleY = 50;

    for (const char of title) {
      ctx.fillText(char, titleX, titleY);
      titleX += ctx.measureText(char).width + letterSpacing;
    }

    ctx.font = `25px ${fontDatas.map(e => `'${e[0]}'`).join(', ')}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#000';
    ctx.fillStyle = '#fff';
    ctx.miterLimit = 1;

    const nameY = 91.5;
    const textWidth = ctx.measureText(name).width;
    let nameX = showDan ? canvas.width * 0.26 : canvas.width / 2;

    if (showDan) {
      const maxWidth = canvas.width / 2 - 20;
      if (textWidth > maxWidth) {
        nameX -= (textWidth - maxWidth) / 2;
      }
    }

    ctx.strokeText(name, nameX, nameY);
    ctx.fillText(name, nameX, nameY);

    if (showDan) {
      const danLevel = document.getElementById('danLevel').value;
      const frameColor = document.getElementById('frameColor').value;
      const passColor = document.getElementById('passColor').value;

      const danImage = new Image();
      danImage.onload = () => {
        const scale = 0.85;
        const danWidth = danImage.width * scale;
        const danHeight = danImage.height * scale;
        const x = canvas.width - danWidth - 100;
        const y = canvas.height - danHeight - 7.5;
        ctx.drawImage(danImage, x, y, danWidth, danHeight);
        isImageDrawn = true;
        downloadButton.disabled = false;
      };
      danImage.onerror = () => {
        alert('すみません。この段位表示は素材がありません。\n見つかり次第追加します🙇‍♀️');
        isImageDrawn = false;
        downloadButton.disabled = true;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      };

      danImage.src = `./images/dani/${danLevel}/${frameColor}-${passColor}.png`;
    } else {
      isImageDrawn = true;
      downloadButton.disabled = false;
    }
  };

  plateImage.onerror = () => {
    alert('プレート画像の読み込みに失敗しました');
    isImageDrawn = false;
    downloadButton.disabled = true;
  };

  plateImage.src = platePath;
}

downloadButton.addEventListener('click', () => {
  if (!isImageDrawn) {
    alert('称号が生成されていません');
    return;
  }
  try {
    const link = document.createElement('a');
    link.download = 'nameplate.png';
    link.href = canvas.toDataURL();
    link.click();
  } catch (e) {
    alert('画像のダウンロードに失敗しました。もう一度お試しください');
    console.error('ダウンロード失敗:', e);
  }
});
