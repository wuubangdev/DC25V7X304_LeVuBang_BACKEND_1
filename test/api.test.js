const assert = require("node:assert/strict");
const { before, after, test } = require("node:test");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const app = require("../src/app");

const run = promisify(execFile);
let server;
let baseUrl;

async function request(method, route, body) {
    const args = [
        "-sS",
        "--max-time",
        "10",
        "-X",
        method,
        "-w",
        "\n%{http_code}",
        baseUrl + route,
    ];
    if (body !== undefined) {
        args.push(
            "-H",
            "Content-Type: application/json",
            "--data-binary",
            typeof body === "string" ? body : JSON.stringify(body),
        );
    }
    const executable = process.platform === "win32" ? "curl.exe" : "curl";
    const { stdout } = await run(executable, args, { windowsHide: true });
    const split = stdout.lastIndexOf("\n");
    return {
        status: Number(stdout.slice(split + 1)),
        body: JSON.parse(stdout.slice(0, split)),
    };
}

async function listen() {
    server = app.listen(0, "127.0.0.1");
    await new Promise((resolve, reject) => {
        server.once("listening", resolve);
        server.once("error", reject);
    });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
}

before(listen);
after(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
});

const routes = [
    ["GET", "/", "Welcome to contact book application."],
    ["GET", "/api/contacts", "findAll handler"],
    ["POST", "/api/contacts", "create handler"],
    ["DELETE", "/api/contacts", "deleteAll handler"],
    ["GET", "/api/contacts/favorite", "findAllFavorite handler"],
    ["GET", "/api/contacts/1", "findOne handler"],
    ["PUT", "/api/contacts/1", "update handler"],
    ["DELETE", "/api/contacts/1", "delete handler"],
];

for (const [method, route, message] of routes) {
    test(`${method} ${route}`, async () => {
        const result = await request(method, route);
        assert.equal(result.status, 200);
        assert.deepEqual(result.body, { message });
    });
}

test("undefined URL returns JSON 404", async () => {
    const result = await request("GET", "/not-defined");
    assert.equal(result.status, 404);
    assert.deepEqual(result.body, { message: "Resource not found" });
});

test("malformed JSON returns 400", async () => {
    assert.equal((await request("POST", "/api/contacts", "{")).status, 400);
});
