import cors from 'cors';
import express from "express";
import routes from "./api/routes.js";

const app = express();

const allowedOrigins = ['http://localhost:3000'];

app.use((req,resp,next) => {
    resp.header("Access-Control-Allow-Origin", "*");
    resp.setHeader("Access-Control-Allow-Origin", "*");
    resp.setHeader("Access-Control-Allow-Credentials", "true");
    resp.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    resp.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type");
    app.use(cors());
    next();
});

app.use(express.json());
app.use(routes);

var port = 3000;

app.listen(port, () => {
    console.log(`Servidor iniciado na porta ${port}`);
});