let currentIndex = 0;
let isAnswerShown = false;
let reviewWords = [];
let isReviewMode = false;
let currentList = [];

function init() {
    currentList = [...words]; // 最初は全単語
    // シャッフルしたい場合はここでシャッフルするが、今回は順不同で良い
    updateUI();
}

function updateUI() {
    if (currentIndex >= currentList.length) {
        showCompletionScreen();
        return;
    }

    const word = currentList[currentIndex];

    // カードの中身をリセット（復習完了メッセージなどで書き換わっている可能性があるため）
    const card = document.querySelector(".card");
    // 必要なら再構築、あるいは既存の要素を使う。
    // showCompletionScreenでinnerHTMLを書き換えるので、ここでは要素があるか確認したほうが安全だが、
    // とりあえずinnerHTMLを戻す処理を入れる。
    if (!document.getElementById("english")) {
         card.innerHTML = `<h2 id="english"></h2><p id="japanese"></p>`;
    }

    document.getElementById("english").innerText = word.en;
    document.getElementById("japanese").innerText = word.ja;
    document.getElementById("japanese").style.display = "none";

    // 進捗表示
    const progressDiv = document.getElementById("progress");
    if (progressDiv) {
        const modeText = isReviewMode ? "Review Mode" : "Normal Mode";
        progressDiv.innerText = `${modeText}: ${currentIndex + 1} / ${currentList.length}`;
    }

    isAnswerShown = false;
    showRevealButton();
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
        // 復習リストに追加（重複チェックあるいはリストの性質によるが、今回は単純に追加）
        // 復習モード中なら、再度間違えたら残す必要があるが、
        // 簡易実装として、通常モードでのミスを復習リストに入れる。
        // 復習モード中に間違えたらどうするか？ -> また復習リストの末尾に追加するか、あるいはそのまま残す。
        // ここでは「通常モードで間違えたものを復習リストに入れる」
        // 「復習モードで間違えたら... 次の復習ラウンドに残す」のが理想だが、
        // 簡易的に「間違えた単語リスト」を別途管理する形にする。

        // 重複を避けるためにID管理などが望ましいが、簡易的にオブジェクトの参照で比較するか、
        // あるいは気にせず追加するか。
        // ここでは単純に追加するが、復習モード中に同じ単語が何度も出るのを避けるため、
        // 復習モードのロジックを少し考える。

        // シンプルに: ミスしたら reviewWords に push。
        reviewWords.push(currentList[currentIndex]);
    }

    currentIndex++;
    updateUI();
}

function showCompletionScreen() {
    const card = document.querySelector(".card");
    const controls = document.getElementById("controls");
    const progressDiv = document.getElementById("progress");

    progressDiv.innerText = "Completed!";

    // reviewWords の重複除去（念のため）
    // オブジェクトの比較は難しいので、とりあえずそのまま

    if (!isReviewMode && reviewWords.length > 0) {
        card.innerHTML = `<h2>Complete!</h2><p style="display:block">間違えた単語が ${reviewWords.length} 個あります。<br>復習しますか？</p>`;
        controls.innerHTML = `<button class="btn" onclick="startReview()">復習する</button>`;
    } else if (isReviewMode && reviewWords.length > 0) {
        card.innerHTML = `<h2>Review Complete!</h2><p style="display:block">まだ ${reviewWords.length} 個の単語が苦手なようです。<br>もう一度やりますか？</p>`;
        controls.innerHTML = `<button class="btn" onclick="startReview()">もう一度復習</button>`;
    } else {
        card.innerHTML = `<h2>All Clear!</h2><p style="display:block">素晴らしい！全ての単語を覚えました。</p>`;
        controls.innerHTML = `<button class="btn" onclick="location.reload()">最初から</button>`;
    }
}

function startReview() {
    currentList = [...reviewWords];
    reviewWords = []; // 次のラウンドのために空にする
    currentIndex = 0;
    isReviewMode = true;

    // カードの中身を元に戻す
    const card = document.querySelector(".card");
    card.innerHTML = `<h2 id="english"></h2><p id="japanese"></p>`;

    updateUI();
}

// 初期化
window.onload = init;
