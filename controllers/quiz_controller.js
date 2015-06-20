var models = require('../models/models.js');

// Autoload :id
exports.load = function (req, res, next, quizId) {
  models.Quiz.find(quizId).then(
    function (quiz) {
      if (quiz) {
        req.quiz = quiz;
        next();
      } else {
        next(new Error('No existe quizId=' + quizId))
      }
    }
  ).catch(function (error) {
    next(error)
  });
};

// GET /quizes
exports.index = function (req, res) {
  var search = req.query.search;
  if (!search || search === '') {
    models.Quiz.findAll().then(
      function (quizes) {
        res.render('quizes/index', {
          quizes: quizes,
          errors: []
        });
      }).catch(function (error) {
      next(error);
    });
  } else {
    search = "%" + search.trim().replace(/\s/g, "%") + "%";
    models.Quiz.findAll({
      where: ['pregunta like ?', search],
      order: 'pregunta ASC'
    }).then(
      function (quizes) {
        res.render('quizes/index', {
          quizes: quizes,
          errors: []
        });
      }).catch(function () {
      next(error);
    });
  }
};

// GET /quizes/:id
exports.show = function (req, res) {
  res.render('quizes/show', {
    quiz: req.quiz,
    errors: []
  });
};

// GET /quizes/:id/answer
exports.answer = function (req, res) {
  var resultado = 'Incorrecto';
  if (req.query.respuesta === req.quiz.respuesta) {
    resultado = 'Correcto';
  }
  res.render('quizes/answer', {
    quiz: req.quiz,
    respuesta: resultado,
    errors: []
  });
};

// GET /quizes/new
exports.new = function (req, res) {
  var quiz = models.Quiz.build({
    pregunta: "Pregunta",
    respuesta: "Respuesta"
  });
  res.render('quizes/new', {
    quiz: quiz,
    errors: []
  });
};

// POST /quizes/create
exports.create = function (req, res) {
  var quiz = models.Quiz.build(req.body.quiz);

  quiz
    .validate()
    .then(function (err) {
      if (err) {
        console.log('Hay error: ' + err.errors);
        res.render('quizes/new', {
          quiz: quiz,
          errors: err.errors
        });
      } else {
        console.log('No hay error');
        quiz // save: guarda en DB campos pregunta y respuesta de quiz
          .save({
            fields: ["pregunta", "respuesta"]
          })
          .then(function () {
            res.redirect('/quizes');
          });
      } // res.redirect: Redirección HTTP a lista de preguntas
    });
};

// GET /quizes/:id/edit
exports.edit = function (req, res) {
  var quiz = req.quiz; // req.quiz: autoload de instancia de quiz

  res.render('quizes/edit', {
    quiz: quiz,
    errors: []
  });
};

// PUT /quizes/:id
exports.update = function (req, res) {
  req.quiz.pregunta = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;

  req.quiz
    .validate()
    .then(
      function (err) {
        if (err) {
          res.render('quizes/edit', {
            quiz: req.quiz,
            errors: err.errors
          });
        } else {
          req.quiz // save: guarda campos pregunta y respuesta en DB
            .save({
              fields: ["pregunta", "respuesta"]
            })
            .then(function () {
              res.redirect('/quizes');
            });
        } // Redirección HTTP a lista de preguntas (URL relativo)
      }
    );
};