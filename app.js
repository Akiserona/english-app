let currentIndex = 0;
let isAnswerShown = false;
let reviewWords = [];
let isReviewMode = false;
let currentList = [];
let currentLevel = '';

function init() {
    showLevelSelection();
}

function selectLevel(level) {
    if (!words[level]) {
        console.error('Invalid level:', level);
        return;
    }
    currentLevel = level;
    // シャッフルせずに順番通り、あるいはシャッフルするか。
    // 要望には特に記述がないが、リストとして見せるなら順番通りが良いかもしれない。
    // いったんそのままコピー
    currentList = [...words[level]];

    currentIndex = 0;
    reviewWords = [];
    isReviewMode = false;

    document.getElementById('level-selection').style.display = 'none';
    document.getElementById('study-screen').style.display = 'block';

    updateUI();
}

function showLevelSelection() {
    const levelSelection = document.getElementById('level-selection');
    levelSelection.style.display = 'flex';
    levelSelection.style.flexDirection = 'column';
    levelSelection.style.alignItems = 'center';
    levelSelection.style.justifyContent = 'center';
    levelSelection.style.height = '100vh';

    document.getElementById('study-screen').style.display = 'none';
    currentList = [];
}

function prevWord() {
    if (currentIndex > 0) {
        currentIndex--;
        updateUI();
    }
}

function nextWord() {
    if (currentIndex < currentList.length - 1) {
        currentIndex++;
        updateUI();
    }
}

function updateUI() {
    // 完了判定
    // handleAnswerでインクリメントされた結果、lengthを超えることがある
    if (currentIndex >= currentList.length) {
        showCompletionScreen();
        return;
    }

    const word = currentList[currentIndex];

    // カード要素の再取得と構築
    // 完了画面等で書き換わっている可能性があるため復元する
    const card = document.querySelector(".card");
    // 中身が構造通りかチェックする簡易的な方法として、IDが存在するか確認
    if (!document.getElementById("english")) {
        card.innerHTML = `<h2 id="english"></h2><p id="japanese"></p>`;
    }

    document.getElementById("english").innerText = word.en;
    document.getElementById("japanese").innerText = word.ja;
    document.getElementById("japanese").style.display = "none";

    // 進捗表示
    const progressDiv = document.getElementById("progress");
    if (progressDiv) {
        const modeText = isReviewMode ? "Review Mode" : (currentLevel ? currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1) : "Mode");
        progressDiv.innerText = `${modeText}: ${currentIndex + 1} / ${currentList.length}`;
    }

    isAnswerShown = false;
    showRevealButton();
    updateNavButtons();
}

function updateNavButtons() {
    // ボタンの有効・無効を視覚的に表現したい場合はここでクラス操作などを行う
    // 今回は単純に押しても反応しないガードを入れているが、
    // 見た目的にも opacity を変えるなどすると親切。
    const prevBtn = document.querySelector('.nav-btn[onclick="prevWord()"]');
    const nextBtn = document.querySelector('.nav-btn[onclick="nextWord()"]');

    if (prevBtn) prevBtn.style.opacity = currentIndex === 0 ? "0.3" : "1";

    // 最後の単語のときは次へ進めない（回答して進むのはOKだが、単純スライドはここまで）
    // 完了画面へは回答ボタンからのみ遷移する仕様にするのが自然
    if (nextBtn) nextBtn.style.opacity = currentIndex >= currentList.length - 1 ? "0.3" : "1";
}

function showRevealButton() {
    const controls = document.getElementById("controls");
    controls.innerHTML = `<button class="btn" onclick="toggleMeaning()">答えを見る</button>`;
}

function showJudgmentButtons() {
    const controls = document.getElementById("controls");
    controls.innerHTML = `
        <button class="btn btn-incorrect" onclick="handleAnswer(false)">まだ (Review)</button>
        <button class="btn btn-correct" onclick="handleAnswer(true)">覚えた (Got it)</button>
    `;
}

function toggleMeaning() {
    const jpText = document.getElementById("japanese");
    jpText.style.display = "block";
    isAnswerShown = true;
    showJudgmentButtons();
}

function handleAnswer(isCorrect) {
    if (!isCorrect) {
        reviewWords.push(currentList[currentIndex]);
    }

    currentIndex++;
    updateUI();
}

function showCompletionScreen() {
    const card = document.querySelector(".card");
    const controls = document.getElementById("controls");
    const progressDiv = document.getElementById("progress");

    if(progressDiv) progressDiv.innerText = "Completed!";

    // ナビゲーションボタンを隠す必要がある
    // main-containerの構造に依存するので、cardの中身だけ書き換えるアプローチだと
    // ナビボタンが残ってしまう。
    // 親要素をいじるか、あるいは nav-btn を visibility: hidden にする。
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => btn.style.visibility = 'hidden');

    if (!isReviewMode && reviewWords.length > 0) {
        card.innerHTML = `<h2>Complete!</h2><p style="display:block">間違えた単語が ${reviewWords.length} 個あります。<br>復習しますか？</p>`;
        controls.innerHTML = `<button class="btn" onclick="startReview()">復習する</button> <button class="btn" onclick="showLevelSelection()">レベル選択へ</button>`;
    } else if (isReviewMode && reviewWords.length > 0) {
        card.innerHTML = `<h2>Review Complete!</h2><p style="display:block">まだ ${reviewWords.length} 個の単語が苦手なようです。<br>もう一度やりますか？</p>`;
        controls.innerHTML = `<button class="btn" onclick="startReview()">もう一度復習</button> <button class="btn" onclick="showLevelSelection()">レベル選択へ</button>`;
    } else {
        card.innerHTML = `<h2>All Clear!</h2><p style="display:block">素晴らしい！全ての単語を覚えました。</p>`;
        controls.innerHTML = `<button class="btn" onclick="showLevelSelection()">レベル選択へ</button>`;
    }
}

function startReview() {
    currentList = [...reviewWords];
    reviewWords = [];
    currentIndex = 0;
    isReviewMode = true;

    // ナビボタンを表示に戻す
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => btn.style.visibility = 'visible');

    // カードリセット
    const card = document.querySelector(".card");
    card.innerHTML = `<h2 id="english"></h2><p id="japanese"></p>`;

    updateUI();
}

window.onload = init;
