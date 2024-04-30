const numbers = new Set();

function generateNumbers() {
  return Math.floor(Math.random() * 10000);
}

function createUniqueNumbers(count) {
  const numberSet = new Set();
  while (numberSet.size < count) {
    const newNumber = generateNumbers();
    numberSet.add(newNumber);
  }
  console.log(numberSet);
  return Array.from(numberSet);
}

const number = createUniqueNumbers(50);
console.log(number);

// const numberStr = number.forEach((testNum) => {
//   testNum.toString();
// });

const numberStr = number.toString().split(",").join("\n");

console.log(numberStr);
