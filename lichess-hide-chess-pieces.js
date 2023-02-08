console.info("[HideChessPiecesExt] script is loaded")
class LichessHideChessPiecesExtApp {
    lichessAttributes = {
        dataIcon: "data-icon"
    }

    lichessTag = {
        cgContainer: "cg-container",
        piece: "piece",
        square: "square"
    }

    lichessBoardCssClasses = {
        lastMove: "last-move",
        moveDest: "move-dest",
        selected: "selected",
        ghost: "ghost"
    }

    lichessCssClasses = {
        siteButtons: "site-buttons"
    }

    emoji = {
        seeNoEvil: String.fromCodePoint(0x1f648),
        hearNoEvil: String.fromCodePoint(0x1f649)
    }

    extCssClasses = {
        noDotMoveDest: "no-dot-move-dest",
        hideBtnTop: "HideChessPiecesExt_hideBtnTop"
    }

    extAttributes = {
        hiddenByExt: "hidden-by-ext"
    }

    extText = {
        showChessPieces: 'Show Chess Pieces',
        hideChessPieces: 'Hide Chess Pieces'
    }

    alwaysVisibleClasses = [
        this.lichessBoardCssClasses.selected,
        this.lichessBoardCssClasses.lastMove,
        this.lichessBoardCssClasses.moveDest,
        this.extCssClasses.noDotMoveDest
    ]

    chessPiecesHidden = false;

    init = () => {
        this.startBoardObserving();
        this.addHideBtnToSiteButtons();
    };

    isPiecesHidden = () => this.chessPiecesHidden;

    setPiecesHiddenFlag = value => {
        this.chessPiecesHidden = value
    };

    startListening = element => {
        element.addEventListener("click", () => {
            if (this.isPiecesHidden()) {
                this.setPiecesHiddenFlag(false);
                this.hideOrShowPiecesAndSquares(false);
            } else {
                this.setPiecesHiddenFlag(true);
                this.hideOrShowPiecesAndSquares(true);
            }
            this.updateHideTop()
        })
    };

    updateHideTop = () => {
        let buttons = document.getElementsByClassName(this.extCssClasses.hideBtnTop);
        if (buttons.length === 0) {
            console.info("[HideChessPiecesExt] hideBtnTop not found")
            return;
        }

        for (const hideBtn of buttons) {
            if (this.isPiecesHidden()) {
                hideBtn.setAttribute(this.lichessAttributes.dataIcon, this.emoji.hearNoEvil)
                hideBtn.title = this.extText.showChessPieces
            } else {
                hideBtn.setAttribute(this.lichessAttributes.dataIcon, this.emoji.seeNoEvil)
                hideBtn.title = this.extText.hideChessPieces
            }
        }
    };

    addHideBtnToSiteButtons = () => {
        let siteButtons = document.getElementsByClassName(this.lichessCssClasses.siteButtons);
        if (siteButtons.length === 0) {
            console.info("[HideChessPiecesExt] siteButtons not found")
        }
        for (const siteButtonPanel of siteButtons) {
            let hideBtnSection = document.createElement("div");
            siteButtonPanel.insertBefore(hideBtnSection, siteButtonPanel.firstChild);

            let aEl = document.createElement("a");
            hideBtnSection.appendChild(aEl);
            aEl.classList.add("link");

            let spanEl = document.createElement("span");
            aEl.appendChild(spanEl);
            spanEl.classList.add(this.extCssClasses.hideBtnTop);
            spanEl.title = this.extText.hideChessPieces;
            spanEl.style = 'filter: grayscale(95%);';
            spanEl.setAttribute(this.lichessAttributes.dataIcon, this.emoji.seeNoEvil);

            this.startListening(aEl);
        }
    };

    startBoardObserving = () => {
        MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

        const boardsContainers = document.getElementsByTagName(this.lichessTag.cgContainer);
        if (boardsContainers.length === 0) {
            console.info("[HideChessPiecesExt] Board to observe not found")
            return;
        }

        for (const boardsContainer of boardsContainers) {
            const config = {attributes: true, childList: true, subtree: true};

            const callback = (mutationList) => {
                for (const mutation of mutationList) {
                    if (this.isPiecesHidden()) {
                        this.hideOrShowPiecesAndSquares(true);
                    }
                }
            };
            new MutationObserver(callback).observe(boardsContainer, config);
        }
    };

    hideOrShowPiecesAndSquares = hide => {
        let boards = document.getElementsByTagName(this.lichessTag.cgContainer);
        if (boards.length === 0) {
            console.info("[HideChessPiecesExt] cg-container not found")
        }
        for (const board of boards) {
            let squareElements = board.getElementsByTagName(this.lichessTag.square);
            if (squareElements.length === 0) {
                console.info("[HideChessPiecesExt] square elements is empty")
            }
            let piecesElements = board.getElementsByTagName(this.lichessTag.piece);
            if (piecesElements.length === 0) {
                console.info("[HideChessPiecesExt] piece elements is empty")
            }
            if (hide) {
                this.hideAll(squareElements);
                this.hideAll(piecesElements)
                this.hideMoveDestDot(board)
            } else {
                this.showAll(squareElements);
                this.showAll(piecesElements);
            }
        }
    };

    hideAll = elements => {
        for (const element of elements) {
            if (element.style.visibility !== 'hidden') {
                let isAlwaysVisible = this.hasAnyClass(element, this.alwaysVisibleClasses);

                if (!isAlwaysVisible) {
                    element.style.visibility = 'hidden';
                    element.setAttribute(this.extAttributes.hiddenByExt, true)
                }
            }
        }
    };

    showAll = elements => {
        for (const element of elements) {
            if (element.style.visibility === 'hidden') {
                let hiddenByExt = element.hasAttribute(this.extAttributes.hiddenByExt);
                let notGhostPiece = !element.classList.contains(this.lichessBoardCssClasses.ghost);
                if (hiddenByExt && notGhostPiece) {
                    element.style.visibility = 'visible';
                    element.removeAttribute(this.extAttributes.hiddenByExt)
                }
            }
        }
    };

    hideMoveDestDot = board => {
        let moveDestElements = board.getElementsByClassName(this.lichessBoardCssClasses.moveDest);
        for (const moveDestElement of moveDestElements) {
            moveDestElement.classList.remove(this.lichessBoardCssClasses.moveDest)
            if (!moveDestElement.classList.contains(this.extCssClasses.noDotMoveDest)) {
                moveDestElement.classList.add(this.extCssClasses.noDotMoveDest);
            }
        }
    };

    hasAnyClass = (element, classesToCheck) => {
        for (const className of element.classList) {
            if (classesToCheck.includes(className)) {
                return true;
            }
        }
        return false;
    };
}

if (document.readyState !== 'complete') {
    window.addEventListener('load', startLichessHideChessPiecesExtApp);
} else {
    startLichessHideChessPiecesExtApp();
}

function startLichessHideChessPiecesExtApp() {
    try {
        let app = new LichessHideChessPiecesExtApp();
        app.init();
        console.info("[HideChessPiecesExt] init success")
    } catch (e) {
        console.error("[HideChessPiecesExt] failed to init app", e)
    }
}
