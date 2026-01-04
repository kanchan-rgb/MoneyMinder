const http = require("http");

const server = http.createServer((req, res) => {
  res.end("TEST SERVER RUNNING");
});

server.listen(5000, "127.0.0.1", () => {
  console.log("✅ Test server listening on 127.0.0.1:5000");
});
