import fetch from "node-fetch";

async function run() {
  const authRes = await fetch("http://localhost:3002/api/auth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: "email_test123",
      email: "test@test.com",
      name: "Test",
      password: "password"
    })
  });
  const authData = await authRes.json();
  if (!authData.token) {
    console.error("Auth failed:", authData);
    return;
  }
  
  const token = authData.token;
  const msg = "i feel stressed";
  
  console.log(`Sending: "${msg}"`);
  const startTime = Date.now();
  
  const chatRes = await fetch("http://localhost:3002/api/chat", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
      history: [{ role: "user", parts: [{ text: msg }] }],
      userState: {}
    })
  });
  const chatData = await chatRes.json();
  const duration = Date.now() - startTime;
  
  console.log(`Reply took ${duration}ms`);
  console.log(`Model: ${chatData.text}\n`);
}
run();
