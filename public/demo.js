const scenarios = [
  [
    { col: 3, row: 0 },
    { col: 4, row: 1 },
    { col: 5, row: 1 },
    { col: 2, row: 2 },
  ],
  [
    { col: 4, row: 0 },
    { col: 0, row: 1 },
    { col: 5, row: 2 },
    { col: 4, row: 4 },
    { col: 3, row: 4 },
  ],
  [
    { col: 3, row: 0 },
    { col: 1, row: 1 },
    { col: 4, row: 1 },
    { col: 0, row: 2 },
    { col: 4, row: 2 },
    { col: 2, row: 3 },
    { col: 3, row: 4 },
  ],
  [
    { col: 5, row: 0 },
    { col: 1, row: 1 },
    { col: 0, row: 2 },
    { col: 4, row: 3 },
  ],
  [
    { col: 0, row: 1 },
    { col: 6, row: 2 },
    { col: 2, row: 3 },
    { col: 4, row: 4 },
    { col: 1, row: 5 },
    { col: 5, row: 6 },
  ],
];

function getRandomInRange(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(0));
}

async function wait(timeout) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

function takeRandomScenario() {
  const randomScenarioIndex = getRandomInRange(0, scenarios.length - 1);
  return scenarios[randomScenarioIndex];
}

function shuffle(inputArray) {
  for (let i = inputArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [inputArray[i], inputArray[j]] = [inputArray[j], inputArray[i]];
  }
  return inputArray;
}

async function generateScenario(makeTree) {
  const scenario = takeRandomScenario();

  const shuffledScenario = shuffle(scenario);

  for (const element of shuffledScenario) {
    await wait(100);
    makeTree(element.col, element.row);
  }
}
