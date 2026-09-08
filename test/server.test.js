const assert = require("node:assert/strict");
const http = require("node:http");
const test = require("node:test");
const os = require("node:os");
const path = require("node:path");

process.env.DB_PATH = path.join(os.tmpdir(), `release-g-test-${process.pid}.db`);

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

function post(server, path, body) {
    const address = server.address();
    const data = JSON.stringify(body);
    const options = {
        hostname: "127.0.0.1",
        port: address.port,
        path,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(data)
        }
    };

    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let responseBody = "";

            res.on("data", (chunk) => {
                responseBody += chunk;
            });

            res.on("end", () => {
                resolve({
                    statusCode: res.statusCode,
                    body: responseBody
                });
            });
        });

        req.on("error", reject);
        req.write(data);
        req.end();
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

test("POST /release/decision persists release history", async () => {
    const server = app.listen(0);

    try {
        const release = {
            version: "1.4.0",
            environment: "production",
            service: "payments-api",
            requestedBy: "david"
        };

        const decisionResponse = await post(server, "/release/decision", release);
        const historyResponse = await request(server, "/release/history");
        const historyBody = JSON.parse(historyResponse.body);

        assert.equal(decisionResponse.statusCode, 200);
        assert.equal(historyResponse.statusCode, 200);
        assert.equal(historyBody.history[0].service, "payments-api");
        assert.equal(historyBody.history[0].version, "1.4.0");
        assert.equal(historyBody.history[0].decision, "DEPLOY");
    } finally {
        server.close();
    }
});
