const checkTests = require("../tools/checkTests");
const checkServiceHealth = require("../tools/checkServiceHealth");
const getOpenIssues = require("../tools/getOpenIssues");
const getPreviousDeployment = require("../tools/getPreviousDeployment");

function createObjective(release) {
    return {
        goal: "Evaluate release safety",
        version: release.version,
        environment: release.environment,
        service: release.service,
        requestedBy: release.requestedBy
    };
}

function createPlan(objective) {
    const plan = [
        "CHECK_TESTS",
        "CHECK_SERVICE_HEALTH",
        "CHECK_OPEN_ISSUES"
    ];

    if (objective.environment === "production") {
        plan.push("CHECK_PREVIOUS_DEPLOYMENT");
    }

    return plan;
}

async function runTools(plan) {
    const results = {};

    if (plan.includes("CHECK_TESTS")) {
        results.tests = await checkTests();
    }

    if (plan.includes("CHECK_SERVICE_HEALTH")) {
        results.health = await checkServiceHealth();
    }

    if (plan.includes("CHECK_OPEN_ISSUES")) {
        results.issues = await getOpenIssues();
    }

    if (plan.includes("CHECK_PREVIOUS_DEPLOYMENT")) {
        results.previousDeployment = await getPreviousDeployment();
    }

    return results;
}

function evaluate(results) {
    let riskLevel = "low";
    const reasons = [];

    if (results.tests && results.tests.failed > 0) {
        riskLevel = "high";
        reasons.push("Tests are failing");
    }

    if (results.issues && results.issues.critical > 0) {
        riskLevel = "high";
        reasons.push("Critical issues are open");
    }

    if (results.health && results.health.status === "unhealthy") {
        riskLevel = "high";
        reasons.push("Service is unhealthy");
    }

    if (results.health && results.health.status === "degraded") {
        if (riskLevel !== "high") {
            riskLevel = "medium";
        }

        reasons.push("Service health is degraded");
    }

    if (
        results.previousDeployment &&
        results.previousDeployment.status === "failed"
    ) {
        if (riskLevel !== "high") {
            riskLevel = "medium";
        }

        reasons.push("Previous deployment failed");
    }

    return {
        riskLevel,
        reasons
    };
}

function makeDecision(evaluation) {
    if (evaluation.riskLevel === "high") {
        return {
            decision: "BLOCK",
            requiresHumanReview: true
        };
    }

    if (evaluation.riskLevel === "medium") {
        return {
            decision: "REVIEW",
            requiresHumanReview: true
        };
    }

    return {
        decision: "DEPLOY",
        requiresHumanReview: false
    };
}

async function runReleaseAgent(release) {
    const objective = createObjective(release);
    const plan = createPlan(objective);
    const results = await runTools(plan);
    const evaluation = evaluate(results);
    const decision = makeDecision(evaluation);

    return {
        objective,
        plan,
        results,
        evaluation,
        decision
    };
}

module.exports = {
    runReleaseAgent,
    createObjective,
    createPlan,
    evaluate,
    makeDecision
};
