/// <reference path="../typings/zim/index.d.ts" />

const scaling = "fit"; // this will resize to fit inside the screen dimensions
const width = 1024;
const height = 768;
const color = darker.lighten(0.4);
const outerColor = darker;
let gameInProgress = false;
let isDemoOn = false;
zon = false;

const frame = new Frame(scaling, width, height, color, outerColor);

frame.on("ready", () => {
  const stage = frame.stage;

  const introLabel = new Label({
    text: `Tile Walker
    
    Mini educational game to demonstrate
    Floyd cycle detection

    Check repo bellow for more details
`,
    color: white,
    italic: true,
    lineHeight: 50,
    align: CENTER,
    backgroundColor: dark,
    padding: 20,
  })
    .center()
    .mov(0, -30);
  introLabel.background.ske(10).mov(50);
  introLabel.alpha = 0;

  const startGameButton = new Button({
    label: "START",
    backgroundColor: blue,
    rollBackgroundColor: green,
    alpha: 0,
    corner: 10,
  })
    .sca(0.7)
    .center()
    .mov(0, 300)
    .tap(() => {
      introLabel.visible = false;
      startGameButton.visible = false;
      checkoutRepoLabel.visible = false;
      frame.color = blue.lighten(0.4);
      makeGame();
    });
  startGameButton.alpha = 0;

  const checkoutRepoLabel = new Label({
    text: "checkout repo",
    color: yellow,
    rollColor: green,
    alpha: 0,
    size: 30,
  })
    .pos(0, 20, CENTER, BOTTOM)
    .tap(() => {
      zgo("https://github.com/borko-rajkovic/tile-walker", "_blank");
    });
  checkoutRepoLabel.alpha = 0;

  introLabel.animate({ alpha: 1 });
  startGameButton.animate({ alpha: 1 });
  checkoutRepoLabel.animate({ alpha: 1 });

  stage.update(); // needed to view changes

  function makeGame() {
    let greenPlayer;
    let greenPlayerDirection = "right";
    let greenPlayerArrow;
    let greenPlayerArrowDirection = "right";
    let greenPlayerPosition = { col: 0, row: 0 };

    let redPlayer;
    let redPlayerDirection = "right";
    let redPlayerArrow;
    let redPlayerArrowDirection = "right";
    let redPlayerPosition = { col: 0, row: 0 };
    let numberOfRedPlayerSteps = 0;

    let treesPositions = [];

    let showArrows = false;

    const board = new Board({
      size: 40,
      cols: 8,
      rows: 8,
      backgroundColor: grey,
      borderColor: dark,
      isometric: true,
    }).center();

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // ADDING TREES ON MOUSE DOWN AND DRAG

    board.on("mousedown", (e) => {
      if (play.text != "PLAY") return;

      makeTree(board.currentTile.boardCol, board.currentTile.boardRow);

      const dragEvent = board.on("change", () => {
        if (!board.currentTile) return; // mouse could be outside board
        makeTree(board.currentTile.boardCol, board.currentTile.boardRow);
      });

      // remove the change event when we pressup
      board.on(
        "pressup",
        () => {
          board.off("change", dragEvent);
        },
        null,
        true
      ); // remove this event after it is run once
    });

    function makeTree(col, row) {
      if (col === 0 && row === 0) return; // first tile is always free
      const existingTree = treesPositions.find(
        (x) => x.col === col && x.row === row
      );
      if (existingTree) {
        board.remove(existingTree.tree);
        treesPositions = treesPositions.filter(
          (x) => !(x.row === row && x.col === col)
        );
      } else {
        const tree = new Tree().sca(0.6).alp(0.7);
        board.add(tree, col, row);
        treesPositions.push({ col, row, tree });
      }

      if (checkForExactlyOneFreeField()) {
        play.enabled = false;
        play.backgroundColor = gray;
      } else {
        play.enabled = true;
        play.backgroundColor = green;
      }

      stage.update();
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // CREATING PLAYERS

    function makePlayers() {
      makeGreenPlayer(0, 0);
      makeRedPlayer(0, 0);
    }

    function makeGreenPlayer(col, row) {
      greenPlayer = makePerson(green, col, row, 15, -5);

      greenPlayer.on("moved", function () {
        greenPlayerArrowDirection = calculateNextStepDirection(
          greenPlayerPosition,
          greenPlayerDirection
        );

        if (greenPlayerArrow) {
          board.remove(greenPlayerArrow);
        }

        if (showArrows) {
          greenPlayerArrow = makeGreenPlayerArrow();
        }
      });
    }

    function makeGreenPlayerArrow() {
      return makeArrow(
        green,
        greenPlayerArrowDirection,
        greenPlayer.boardCol,
        greenPlayer.boardRow
      );
    }

    function makeRedPlayer(col, row) {
      redPlayer = makePerson(red, col, row, -5, 5);

      redPlayer.on("movingdone", function () {
        playGame();
      });

      redPlayer.on("moved", function () {
        markCellAsVisited(redPlayer.boardCol, redPlayer.boardRow);

        numberOfRedPlayerSteps++;

        redPlayerArrowDirection =
          numberOfRedPlayerSteps % 2 === 0
            ? calculateNextStepDirection(redPlayerPosition, redPlayerDirection)
            : redPlayerDirection;

        if (redPlayerArrow) {
          board.remove(redPlayerArrow);
        }

        if (showArrows) {
          redPlayerArrow = makeRedPlayerArrow();
        }

        if (redPlayer.square === greenPlayer.square) {
          redPlayer.mov(-5, 5);
          greenPlayer.mov(15, -5);
          greenPlayer.bot();
        }

        generations.score = Math.floor(numberOfRedPlayerSteps / 2);

        elements.score = board.tiles.children.filter(
          (tile) => tile.lastColor === blue
        ).length;
      });
    }

    function makeRedPlayerArrow() {
      return makeArrow(
        red,
        redPlayerArrowDirection,
        redPlayer.boardCol,
        redPlayer.boardRow
      );
    }

    function makePerson(personColor, col, row, moveX, moveY) {
      const person = new Person(personColor, brown, brown).sca(0.7);

      board.add(person, col, row);

      person.mov(moveX, moveY);

      stage.update();

      return person;
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // MARKING VISITED CELLS

    function markCellAsVisited(col, row) {
      const tile = board.getTile(col, row);
      board.setColor(tile, blue);
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // DIRECTION ARROWS

    function makeArrow(arrowColor, direction, col, row) {
      const factor = 10;
      const container = new Container();
      const arrow = new Triangle({ color: arrowColor });

      let adjustment = 0;

      switch (direction) {
        case "left":
          adjustment = 3;
          col -= 1;
          break;
        case "right":
          adjustment = 1;
          col += 1;
          break;
        case "up":
          adjustment = 0;
          row -= 1;
          break;
        case "down":
          adjustment = 2;
          row += 1;
          break;
      }

      board.add(container, col, row);

      arrow.mov(40);
      arrow.rot(45 + 90 * adjustment).centerReg(container);
      container.sca(2 / factor, 1 / factor);
      container.bot();

      return container;
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // TOP INTERFACE

    new Label("Tile Walker").alp(0.6).pos(-10, 30, CENTER); // -10 from center and 30 from top

    // used .place() to loc() these - also put to .bot() so trees go over text boxes
    // passing in LEFT or RIGHT will turn these isometric
    const elements = new Scorer(1, LEFT, null, null, white, orange)
      .loc(189, 169)
      .bot();
    new Label("stepped on  ")
      .sca(0.5)
      .alp(0.6)
      .pos(0, -30, CENTER, TOP, elements);

    const generations = new Scorer(0, RIGHT, null, null, white, yellow)
      .loc(961, 235)
      .bot();
    new Label("  iterations")
      .sca(0.5)
      .alp(0.6)
      .pos(0, -30, CENTER, TOP, generations);

    makePlayers();

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // MAIN GAME OF TILE WALKER

    function playGame() {
      if (!gameInProgress) {
        return;
      }

      greenNextDirection = calculateNextStepDirection(
        greenPlayerPosition,
        greenPlayerDirection
      );

      redNextDirection = calculateNextStepDirection(
        redPlayerPosition,
        redPlayerDirection
      );

      // colision - exit condition
      if (
        numberOfRedPlayerSteps > 1 &&
        redPlayer.square === greenPlayer.square &&
        greenNextDirection === redNextDirection
      ) {
        // if demo, show controls
        if (isDemoOn) {
          isDemoOn = false;
          demoFinished();
        }
        play.visible = true;
        newGame.visible = true;
        pause.visible = false;
        showArrowsCheckbox.visible = false;
        showArrowsCheckbox.checked = false;
        showArrows = false;
        if (greenPlayerArrow) {
          board.remove(greenPlayerArrow);
        }
        if (redPlayerArrow) {
          board.remove(redPlayerArrow);
        }
        stage.update();
        return;
      }

      board.followPath(
        greenPlayer,
        calculatePathGreen(),
        speed.currentValue,
        speed.currentValue / 2
      );

      board.followPath(
        redPlayer,
        calculatePathRed(),
        speed.currentValue,
        speed.currentValue / 2
      );
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // BOTTOM INTERFACE

    // these components will be added to a Tile and placed at bottom
    // this is optional but it is easier than positioning each one

    const speed = new Slider({
      min: 100,
      max: 900,
      barLength: 200,
      currentValue: 1000,
    }).sca(0.8);
    new Label("speed").sca(0.7).alp(0.5).pos(-5, -40, CENTER, TOP, speed);

    // we are duplicating a few components so use STYLE to simplify
    // could add the Slider styles above but there is only on Slider
    STYLE = {
      type: {
        Button: {
          backgroundColor: series(yellow, green),
          rollBackgroundColor: pink,
          corner: 10,
          scale: 0.7,
        },
        CheckBox: {
          size: 35,
          alpha: 0.7,
        },
      },
    };

    function resetTilesColor() {
      board.tiles.children.forEach((tile) => {
        board.setColor(tile, grey);
      });
      markCellAsVisited(0, 0);
    }

    const newGame = new Button({ label: "NEW" }).tap(() => {
      play.toggle(false); // incase currently playing set toggle back
      board.clearItems();
      makePlayers();
      resetTilesColor();
      elements.score = 1;
      generations.score = 0;
      pause.checked = false;

      greenPlayerDirection = "right";
      greenPlayerPosition = { col: 0, row: 0 };
      redPlayerDirection = "right";
      redPlayerPosition = { col: 0, row: 0 };
      numberOfRedPlayerSteps = 0;
      treesPositions = [];
      gameInProgress = false;
      play.visible = true;
      newGame.visible = true;
      showArrows = false;
      if (greenPlayerArrow) {
        board.remove(greenPlayerArrow);
      }
      if (redPlayerArrow) {
        board.remove(redPlayerArrow);
      }

      stage.update();
    });

    function checkForExactlyOneFreeField() {
      const existTree01 = treesPositions.find(
        (tree) => tree.col === 1 && tree.row === 0
      );
      const existTree10 = treesPositions.find(
        (tree) => tree.col === 0 && tree.row === 1
      );
      return existTree01 && existTree10;
    }

    const play = new Button({ label: "PLAY", toggle: "REPLAY" }).tap(() => {
      if (play.toggled) {
        gameInProgress = true;
        playGame();
      } else {
        board.remove(redPlayer);
        board.remove(greenPlayer);
        if (greenPlayerArrow) {
          board.remove(greenPlayerArrow);
        }
        if (redPlayerArrow) {
          board.remove(redPlayerArrow);
        }
        makePlayers();
        resetTilesColor();
        elements.score = 1;
        generations.score = 0;
        pause.checked = false;

        greenPlayerDirection = "right";
        greenPlayerPosition = { col: 0, row: 0 };
        redPlayerDirection = "right";
        redPlayerPosition = { col: 0, row: 0 };
        numberOfRedPlayerSteps = 0;
        gameInProgress = true;
        play.toggle(true);
        playGame();
      }

      play.visible = false;
      newGame.visible = false;
      showArrowsCheckbox.visible = true;
      pause.visible = true;
    }); // end play button

    const pause = new CheckBox({ label: "pause" }).change(() => {
      gameInProgress = !gameInProgress;
      playGame();
    });

    const showArrowsCheckbox = new CheckBox({ label: "show arrows" }).change(
      () => {
        showArrows = !showArrows;

        if (showArrows) {
          greenPlayerArrow = makeGreenPlayerArrow();
          redPlayerArrow = makeRedPlayerArrow();
        } else {
          board.remove(greenPlayerArrow);
          board.remove(redPlayerArrow);
        }

        stage.update();
      }
    );

    // NOTE: the clone is set to false so we keep our events
    const interface = new Tile({
      obj: series(speed, newGame, play, pause, showArrowsCheckbox),
      cols: 5,
      colSize: series(200, 180, 165, 140),
      valign: CENTER,
      clone: false,
    }).pos(0, 30, CENTER, BOTTOM);

    function calculateNextStepDirection(position, direction) {
      switch (direction) {
        case "right":
          if (
            position.col + 1 >= board.cols ||
            checkIfTreeIsOnPosition(position.col + 1, position.row)
          ) {
            return calculateNextStepDirection(position, "down");
          }
          return direction;
        case "left":
          if (
            position.col - 1 < 0 ||
            checkIfTreeIsOnPosition(position.col - 1, position.row)
          ) {
            return calculateNextStepDirection(position, "up");
          }
          return direction;
        case "up":
          if (
            position.row - 1 < 0 ||
            checkIfTreeIsOnPosition(position.col, position.row - 1)
          ) {
            return calculateNextStepDirection(position, "right");
          }
          return direction;
        case "down":
          if (
            position.row + 1 >= board.rows ||
            checkIfTreeIsOnPosition(position.col, position.row + 1)
          ) {
            return calculateNextStepDirection(position, "left");
          }
          return direction;
      }
    }

    function calculateNextStep(position, direction) {
      const nextStepDirection = calculateNextStepDirection(position, direction);
      switch (nextStepDirection) {
        case "right":
          position.col = position.col + 1;
          break;
        case "left":
          position.col = position.col - 1;
          break;
        case "up":
          position.row = position.row - 1;
          break;
        case "down":
          position.row = position.row + 1;
          break;
      }

      return { position, direction: nextStepDirection };
    }

    function checkIfTreeIsOnPosition(col, row) {
      return (
        treesPositions.filter((x) => x.col === col && x.row === row).length > 0
      );
    }

    function calculatePathGreen() {
      const path = calculateNextStep(greenPlayerPosition, greenPlayerDirection);
      greenPlayerDirection = path.direction;
      return [{ x: path.position.col, y: path.position.row }];
    }

    function calculatePathRed() {
      const step1 = calculateNextStep(redPlayerPosition, redPlayerDirection);
      redPlayerDirection = step1.direction;
      const step1Path = { x: step1.position.col, y: step1.position.row };
      const step2 = calculateNextStep(redPlayerPosition, redPlayerDirection);
      redPlayerDirection = step2.direction;
      const step2Path = { x: step2.position.col, y: step2.position.row };
      return [step1Path, step2Path];
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // DEMO
    markCellAsVisited(0, 0);

    generateScenario(makeTree).then(playGame);

    // the interface controls things so need to set and reset stuff
    interface.alpha = 0;
    speed.currentValue = 200;
    isDemoOn = true;
    gameInProgress = true;
    play.toggle(true);

    function demoFinished() {
      speed.currentValue = 500;
      interface.animate({ alpha: 1 });
    }
  }
});
