window.onload = () => {

    /**
     * domの生成・位置取得
     */
    const setDomPosition = (dom, pos) => {
        dom.style.left = `${pos.x}px`;
        dom.style.top = `${pos.y}px`;
    }

    const getDomPosition = (dom) => {
        const pos = {
            x: parseFloat(dom.style.left),
            y: parseFloat(dom.style.top)
        };
        return pos;
    }

    const createDom = (className) => {
        const dom = document.createElement('div');
        dom.classList.add(className);
        return dom;
    }

    const addChildDom = (parentDom, childDom) => {
        parentDom.append(childDom);
    }

    const removeChildDom = (parentDom, childDom) => {
        parentDom.removeChild(childDom);
    }

    const changeDomTextContent = (dom, textContent) => {
        dom.textContent = textContent;
    }

    /**
     * 入力イベント
     */
    const leftButtonPress = () => {
        barLeftSpeed = 5;
    }

    const leftButtonRelease = () => {
        barLeftSpeed = 0;
    }

    const rightButtonPress = () => {
        barRightSpeed = 5;
    }

    const rightButtonRelease = () => {
        barRightSpeed = 0;
    }

    const displayRelease = () => {
        if (gameMode === "startWait") {
            changeDomTextContent(explainLabelDom, "break all blocks!");
            gameMode = "gamePlaying";
        }
    }

    /**
     * メインループイベント
     */
    const mainLoop = () => {
        switch (gameMode) {
            case "gamePlaying":
                {
                    // バーの操作
                    const barPos = getDomPosition(barDom);
                    const barMovedPos = {
                        x: barPos.x + barRightSpeed - barLeftSpeed,
                        y: barPos.y
                    };
                    if (barMovedPos.x >= 0 && barMovedPos.x <= 340) {
                        setDomPosition(barDom, barMovedPos);
                    }

                    // ボール移動
                    const ballPos = getDomPosition(ballDom);
                    let ballMovedPos = {
                        x: ballPos.x + ballVec.x,
                        y: ballPos.y + ballVec.y
                    };
                    if (ballMovedPos.x > 390) {
                        ballMovedPos.x = 390;
                        ballVec.x = -ballVec.x;
                    }
                    if (ballMovedPos.x < 0) {
                        ballMovedPos.x = 0;
                        ballVec.x = -ballVec.x;
                    }
                    if (ballMovedPos.y < 0) {
                        ballMovedPos.y = 0;
                        ballVec.y = -ballVec.y;
                    }
                    if (ballMovedPos.y > 510) {
                        init(); // ボールが画面下にいってしまうとゲームオーバーなので初期化する
                    } else {
                        setDomPosition(ballDom, ballMovedPos);
                    }

                    // ブロックとの衝突処理
                    for (const blockDom of blockDoms) {
                        const blockPos = getDomPosition(blockDom);
                        if (checkCollision({ x: blockPos.x, y: blockPos.y, width: 40, height: 20 }, { x: ballMovedPos.x, y: ballMovedPos.y, width: 10, height: 10 })) {
                            removeChildDom(displayDom, blockDom);
                            blockDoms = blockDoms.filter((dom => {
                                return dom != blockDom;
                            }));
                            ballVec.y = -ballVec.y;
                        }
                    }

                    // バーと球の衝突処理
                    if (checkCollision({ x: barPos.x, y: barPos.y, width: 60, height: 20 }, { x: ballMovedPos.x, y: ballMovedPos.y, width: 10, height: 10 })) {
                        ballMovedPos.y = barDom.y;
                        ballVec.y = -ballVec.y;
                    }

                    // ブロックが全てなくなったか調べる
                    if (blockDoms.length === 0) {
                        gameMode = "clear";
                        changeDomTextContent(explainLabelDom, "CLEAR!");
                    }


                    break;
                }
        }
        window.requestAnimationFrame(mainLoop);
    };
    window.requestAnimationFrame(mainLoop);

    /**
     * ロジック部分
     */

    // 初期化関数
    const init = () => {
        // 状態の初期化
        gameMode = "startWait";

        changeDomTextContent(explainLabelDom, "click to start");

        // 静的な定義DOMの座標定義
        setDomPosition(barDom, { x: 175, y: 410 });
        setDomPosition(leftButtonDom, { x: 50, y: 440 });
        setDomPosition(rightButtonDom, { x: 250, y: 440 });
        setDomPosition(ballDom, { x: 190, y: 300 });
        setDomPosition(explainLabelDom, { x: 0, y: 350 });

        // ボール向き定義
        ballVec = { x: 3, y: -3 };


        // 画面にブロックが残っていれば、全部削除してblockDomsを空にする
        while (blockDoms.length > 0) {
            removeChildDom(displayDom, blockDoms.pop());
        }


        //ブロック生成 (w:20px h:10px)
        for (let xIndex = 0; xIndex < 10; xIndex++) {
            for (let yIndex = 0; yIndex < 10; yIndex++) {
                const blockDom = createDom("block");
                setDomPosition(blockDom, { x: xIndex * 40, y: yIndex * 20 });
                addChildDom(displayDom, blockDom);
                blockDoms.push(blockDom);
            }
        }
    }


    const calcLength = (pos1, pos2) => {
        return Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2);
    }

    const checkCollision = (rect1, rect2) => {
        if ((rect1.x + rect1.width) >= rect2.x && rect1.x <= (rect2.x + rect2.width) && (rect1.y + rect1.height) >= rect2.y && rect1.y <= (rect2.y + rect2.height)) {
            return true;
        }
        return false;
    }



    // 副作用を持つ状態変数の定義
    let blockDoms = [];
    let barLeftSpeed = 0;
    let barRightSpeed = 0;
    let ballVec = { x: 5, y: 5 };
    let gameMode = "startWait"; // "startWait"|"gamePlaying"|"clear"



    // 初期から存在するDOMの定義
    const displayDom = document.getElementsByClassName("display")[0];
    const barDom = document.getElementsByClassName("bar")[0];
    const ballDom = document.getElementsByClassName("ball")[0];
    const leftButtonDom = document.getElementsByClassName("left-button")[0];
    const rightButtonDom = document.getElementsByClassName("right-button")[0];
    const explainLabelDom = document.getElementsByClassName("explain-label")[0];


    /**
     * 入力系
     */
    // MEMO: ＰＣとスマホでタッチにベントが異なるので複数作成する 
    //       実はPC・スマホ両方使えるpointerdown/pointerupというイベントがあるのだが、古いsafariがこれで動作しないので不採用
    //       あと数年たったら死滅すると思われるのでpointer系のイベントが使えるようになるはず
    // ＰＣ用
    leftButtonDom.addEventListener("mousedown", leftButtonPress, false);
    leftButtonDom.addEventListener("mouseup", leftButtonRelease, false);
    leftButtonDom.addEventListener("mouseout", leftButtonRelease, false);
    rightButtonDom.addEventListener("mousedown", rightButtonPress, false);
    rightButtonDom.addEventListener("mouseup", rightButtonRelease, false);
    rightButtonDom.addEventListener("mouseout", rightButtonRelease, false);
    displayDom.addEventListener("mouseup", displayRelease, false);


    // スマホ用
    leftButtonDom.addEventListener("touchstart", leftButtonPress, false);
    leftButtonDom.addEventListener("touchend", leftButtonRelease, false);
    rightButtonDom.addEventListener("touchstart", rightButtonPress, false);
    rightButtonDom.addEventListener("touchend", rightButtonRelease, false);
    displayDom.addEventListener("touchend", displayRelease, false);


    init();
}