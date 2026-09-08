const express = require("express");
const { runReleaseAgent } = require("./agent/agent");
const {
    getReleaseHistory,
    saveReleaseDecision
} = require("./database/db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.get("/health", (req, res) => {
    res.status(200).json({
        ok: true,
        app: process.env.APP_NAME || "release-g",
        mensaje: "Solicitud procesada con exito"
    });
});

app.get("/ready", (req, res) => {
    res.status(200).json({
        ok: true,
        ready: true
    });
});

app.post("/release/decision", async (req, res) => {
    const { version, environment, service, requestedBy } = req.body;

    if (!version || !environment || !service || !requestedBy) {
        return res.status(400).json({
            ok: false,
            mensaje: "Faltan parametros en la solicitud"
        });
    }

    const result = await runReleaseAgent({
        version,
        environment,
        service,
        requestedBy
    });

    saveReleaseDecision(
        {
            version,
            environment,
            service,
            requestedBy
        },
        result
    );

    res.status(200).json({
        ok: true,
        result
    });
});

app.get("/release/history", (req, res) => {
    res.status(200).json({
        ok: true,
        history: getReleaseHistory()
    });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
}

module.exports = app;
