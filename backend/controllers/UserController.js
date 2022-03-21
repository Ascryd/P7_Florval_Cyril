const bcrypt = require("bcrypt")
const db = require ("../database/db.mysql")
const jwt = require("jsonwebtoken")


exports.signup = (req, res) => {
    bcrypt.hash(req.body.password, 10) // --------------> On hash le mdp avec Bcrypt (ici 10 fois)
    .then(hash => {
      const user = { 
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hash
      }   
      return user
    })
    
    .then(user => {
      console.log(user)
      const sql = "INSERT INTO user SET ?"
        db.query(sql, user, (err, results, fields) => {
            if (err) {
              console.log(err)
              res.status(500).json({err})
            } else {
              console.log(results)
              res.json({message: "Utilisateur enregistré"})
            }
        })
    })
    .catch(error => res.status(500).json({ error })) // --------------> Message si échec
}





exports.login = (req, res) => {
    const sql = "SELECT * FROM user WHERE email = ?"
    console.log(req.body.email);
    db.query(sql, req.body.email, (err, results, fields) => {
      console.log(results);
      if (err) {
        console.log(err)
        res.status(500).json({err})
      } else if (!results[0]) { // PB ici !!!!!!!!!!! Fonctionne mais plus simple ou plus propre possible ? 
        console.log(err + " aucune adresse mail trouvé !")
        res.status(500).json({err})
      } else {
        console.log("Le résultat de la requête :  " + JSON.stringify(results))
        
        bcrypt.compare(req.body.password, results[0].password)
          .then (valid => {
            if (!valid) {
              return res.status(401).json ({ success: false, error: "Mot de passe incorect !"})
            } else {
              console.log("connexion autorisé")
              res.status(200).json ({
                userId: results[0]._id,
                token: jwt.sign (
                  { userId: results[0]._id },
                  "RANDOM_TOKEN_SECRET",
                  { expiresIn: "24h" }
                )
              })
            }
          })
          .catch(error => res.status(500).json({ error }))
      }
    })
}

exports.infos = (req, res) => {
  const token = req.headers.authorization
  const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET")
  const userId = decodedToken.userId
  const sql = "SELECT firstName, lastName, email FROM user WHERE `_id` = ?"
  db.query(sql, userId, (err, results, fields) => {
    if (err){
        console.log(err)
        res.json({err})
    } else {
        console.log(results)
        res.json({message: "Infos récupérées", results})  
    }
  })
}

exports.delete = (req, res) => {
  // const sql = 
}