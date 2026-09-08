const assert = require("node:assert/strict");
const test = require("node:test");
const { evaluate, makeDecision } = require("../src/agent/agent");

function decide(results) {
    return makeDecision(evaluate(results));
}

test("tests OK and 0 critical issues returns DEPLOY", () => {
    const decision = decide({
        tests: {
            passed: 42,
            failed: 0,
            status: "passed"
        },
        health: {
            status: "healthy"
        },
        issues: {
            critical: 0
        }
    });

    assert.equal(decision.decision, "DEPLOY");
    assert.equal(decision.requiresHumanReview, false);
});

test("tests FAIL returns BLOCK", () => {
    const decision = decide({
        tests: {
            passed: 41,
            failed: 1,
            status: "failed"
        },
        health: {
            status: "healthy"
        },
        issues: {
            critical: 0
        }
    });

    assert.equal(decision.decision, "BLOCK");
    assert.equal(decision.requiresHumanReview, true);
});

test("critical issue greater than 0 returns BLOCK", () => {
    const decision = decide({
        tests: {
            passed: 42,
            failed: 0,
            status: "passed"
        },
        health: {
            status: "healthy"
        },
        issues: {
            critical: 1
        }
    });

    assert.equal(decision.decision, "BLOCK");
    assert.equal(decision.requiresHumanReview, true);
});

test("ambiguous state returns REVIEW", () => {
    const decision = decide({
        tests: {
            passed: 42,
            failed: 0,
            status: "passed"
        },
        health: {
            status: "degraded"
        },
        issues: {
            critical: 0
        }
    });

    assert.equal(decision.decision, "REVIEW");
    assert.equal(decision.requiresHumanReview, true);
});
