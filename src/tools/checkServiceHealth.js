async function checkServiceHealth() {
    return {
        status: "healthy",
        responseTimeMs: 120
    };
}

module.exports = checkServiceHealth;
