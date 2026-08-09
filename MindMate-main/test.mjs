import fetch from "node-fetch";

async function run() {
  try {
    const msg = "i feel stressed";
    console.log(`Sending: "${msg}"`);

    const startTime = Date.now();

    const response = await fetch("http://10.123.187.221:5000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: msg,
        user_id: "test"
      })
    });

    const data = await response.json();

    const duration = Date.now() - startTime;

    console.log(`Reply took ${duration}ms`);
    console.log(`Model: ${data.reply}`);
  } catch (error) {
    console.error("Error:", error);
  }
}

run();