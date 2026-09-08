const express = require("express");
const { runReleaseAgent } = require("./agent/agent");

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.get("/health", (req, res) => {
    res.status(200).json({
        ok: true,
        mensaje: "Solicitud procesada con exito"
    });
});

app.get("/ready", (req, res) => {
    res.send("We are Ready!!!");
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

    res.status(200).json({
        ok: true,
        result
    });
});

app.get("/release/history", (req, res) => {
    res.status(200).json({
        ok: true,
        history: []
    });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
}

module.exports = app;
