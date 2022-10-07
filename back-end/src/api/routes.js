import express from "express";
import users from "../api/controllers/usersController";
import login from "../api/controllers/loginController";
import courses from "../api/controllers/coursesController";
import disciplines from "../api/controllers/disciplinesController";

const routes = express.Router();

/*-----------Usuário-------------*/
routes.get("/users", users.findAll);
routes.post("/users",users.store);

/*-----------Login-------------*/
routes.post("/login", login.login);

/*-----------Course-------------*/
routes.get("/courses", courses.findAll);
routes.post("/courses", users.store);

/*-----------Discipline-------------*/
routes.get("/disciplines", disciplines.findAll);
routes.post("/disciplines", disciplines.store);
/*-----------System-Discipline-------------*/
routes.get("/system-disciplines", disciplines.findAll);
routes.post("/system-disciplines", disciplines.store);

export { routes as default };
