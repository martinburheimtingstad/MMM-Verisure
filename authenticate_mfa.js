const Verisure = require('verisure');
const readline = require('readline/promises');

const verisure = new Verisure('<username>', '<password>');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function authenticate() {
  console.log("Getting token");
  await verisure.getToken();
  console.log("Got token");
  await sleep(5000);

  const code = await rl.question('One-time code send, enter it below:');

  console.log(code);

  await verisure.getToken(code);
  console.log(verisure.cookies);
  process.exit();
}

authenticate();
