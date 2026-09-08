const express = require("express");
const app = express();

app.use(express.json());
app.listen(3000, () => console.log('Servidor corriendo en el puerto 3000'
));


app.get("/", (req, res) =>{
    res.send("Hello World");
});

app.get("/health", (req, res) =>{
    res.status(200).json({
        ok: true,
        mensaje: "¡Solicitud procesada con éxito!"
    });
});

app.get("/ready", (req, res) =>{
    res.send("We are Ready!!!");
});

app.post("/release/decision", (req, res) =>{
    const { version, environment, service, requestedBy } = req.body;

    if (!version || !environment || !service || !requestedBy) {
        return res.status(400).json({
            ok: false,
            mensaje: "Faltan parámetros en la solicitud"
        });
    }
    
    res.status(200).json({
        ok: true,
        mensaje: "Decisión de liberación procesada con éxito"
    });

app.get("/release/history", (req, res) =>{
    
});    

});


