const NRIC = require("./nric");
const fs = require("fs"); // Import the file system module

function generateUnique(count) {
  const uniqueNric = new Set();

  while (uniqueNric.size < count) {
    const nric = NRIC.Generate();

    uniqueNric.add(nric.toString());
  }
  return Array.from(uniqueNric, (nricStr) => new NRIC(nricStr));
}

const nricCount = 6000000;

const uniqueNricArray = generateUnique(nricCount);

const nricString = uniqueNricArray.map((nric) => nric.toString()).join("\n");

// Write the string to a file
fs.writeFile("nricOutput.txt", nricString, (err) => {
  if (err) {
    console.log("Error occurred:", err);
  } else {
    console.log(`File written with ${nricCount} unique NRIC numbers.`);
  }
});
