import * as yup from 'yup';
import DisciplineRepository from "../../models/discipline.mjs";
import UserRepository from "../../models/user.mjs";
import moment from "moment";
import UserCourseDisciplineRepository from "../../models/userCourseDiscipline.mjs";

async function findAll(req, res) {

  UserRepository.findAll().then(data => {
    res.send(data);
  })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    })
}

async function findById(req, res) {

  UserRepository.findAll({ where: { idUser: req.body.idUser } }).then(data => {
    res.send(data);
  })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    })
}


async function store(req, res) {

  let schema = yup.object({
    name: yup.string().required(),
    email: yup.string().email().required(),
    password: yup.string().required(),
    registration: yup.string().required(),
    birth_date: yup.date().optional(),
    period: yup.number().optional(),
    idCourse: yup.string().required()
  });

  if (!(await schema.isValid(req.body))) {
    return res.status(400).json({
      error: true,
      message: "Dados inválidos"
    })
  }

  let userExist = await UserRepository.findOne({ where: { email: req.body.email } });
  if (userExist) {
    return res.status(400).json({
      error: true,
      message: "Este usuário já existe!"
    })
  }

  const { name, email, password, registration, birth_date, period, idCourse } = req.body;

  let disciplines = await DisciplineRepository.findAll({ where: { idCourse: idCourse } });

  const data = { name, email, password, registration, birth_date, period };

  //data.password = await bcrypt.hash(data.password, 8); //TODO Esta dando erro na criptação

  let dataRelation;

  const user = await UserRepository.create(data).then(async (resp) => {
    await Promise.all(disciplines.forEach(async discipline => {
      dataRelation = { idCourse, idUser: resp.id, idDiscipline: discipline.id, status: 3 };

      await UserCourseDisciplineRepository.create(dataRelation).then(data => {
        console.log(data)
      }).catch(err => {
        res.status(400).json({
          error: err
        })
      });
    }));

    res.status(200).json({
      error: false,
      message: "Usuário cadastrado com sucesso!"
    })

  })
    .catch(err => {
      res.status(400).json({
        error: err
      })
    })

}

export default { findAll, store, findById };
