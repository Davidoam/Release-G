const assert = require("node:assert/strict");
const http = require("node:http");
const test = require("node:test");
const app = require("../src/server");

function request(server, path) {
    const address = server.address();
    const url = `http://127.0.0.1:${address.port}${path}`;

    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let body = "";

            res.on("data", (chunk) => {
                body += chunk;
            });

            res.on("end", () => {
                resolve({
                    statusCode: res.statusCode,
                    body
                });
            });
        }).on("error", reject);
    });
}

test("/health returns 200", async () => {
    const server = app.listen(0);

    try {
        const response = await request(server, "/health");

        assert.equal(response.statusCode, 200);
    } finally {
        server.close();
    }
});
