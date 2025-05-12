const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let isImageDrawn = false;
let isFontLoaded = false;

const submitButton = document.getElementById('submitButton');
submitButton.disabled = true;

const downloadButton = document.getElementById('downloadButton');
downloadButton.disabled = true;

const font = new FontFace("TnT", "url('./fonts/TnT.ttf')");
font.load().then((loadedFont) => {
  document.fonts.add(loadedFont);
  isFontLoaded = true;
  submitButton.disabled = false;
});

const danToggle = document.getElementById('danToggle');
const danOptions = document.getElementById('danOptions');

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
  const title = document.getElementById('title').value;
  const name = document.getElementById('name').value;
  const showDan = document.getElementById('danToggle').checked;
  const type = document.getElementById('type').value;

  if (!title.trim()) {
    alert('称号名を入力してください');
    return;
  }

  if (!name.trim()) {
    alert('プレイヤー名を入力してください');
    return;
  }

  const platePath = showDan
    ? `./images/plate/dan/${type}.png`
    : `./images/plate/no-dan/${type}.png`;

  const plateImage = new Image();
  plateImage.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.height = 117;

    const y = canvas.height - plateImage.height;
    ctx.drawImage(plateImage, 0, y, canvas.width, plateImage.height);

    let titleFontSize = 20;
    if (title.length > 23) titleFontSize = 14;

    ctx.font = `${titleFontSize}px TnT`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';

    const letterSpacing = 1;
    let titleWidth = 0;
    for (let i = 0; i < title.length; i++) {
      titleWidth += ctx.measureText(title[i]).width + letterSpacing;
    }

    let titleX = (canvas.width - titleWidth + letterSpacing) / 2;
    const titleY = 50;

    for (let i = 0; i < title.length; i++) {
      ctx.fillText(title[i], titleX, titleY);
      titleX += ctx.measureText(title[i]).width + letterSpacing;
    }

    ctx.font = '25px TnT';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#000';
    ctx.fillStyle = '#fff';
    ctx.miterLimit = 1;

    const nameY = 90;
    const textWidth = ctx.measureText(name).width;
    let nameX;

    if (showDan) {
      const centerX = canvas.width * 0.26;
      const maxWidth = canvas.width / 2 - 20;
      nameX = centerX;
      if (textWidth > maxWidth) {
        const overflow = textWidth - maxWidth;
        nameX -= overflow / 2;
      }
    } else {
      nameX = canvas.width / 2;
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
      };

      const danImagePath = `./images/dani/${danLevel}/${frameColor}-${passColor}.png`;
      danImage.src = danImagePath;
    } else {
      isImageDrawn = true;
      downloadButton.disabled = false;
    }
  };

  plateImage.onerror = () => {
    alert('プレート画像の読み込みに失敗しました');
    isImageDrawn = false;
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
