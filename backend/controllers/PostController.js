const db = require ("../database/db.mysql")
const fs = require("fs")

const fsResultHandler = function(err) { 
    if(err) {
       console.log("unlink failed", err);
    } else {
       console.log("file deleted");
    }
} 

exports.postMessage = (req, res) => {
    const post = req.file ?
    {
        ...req.body,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body } //-------------- Undefined image dans la BDD
    console.log(post)

    const sql = "INSERT INTO messages SET ?"
    db.query(sql, post, (err, results, fields) => {
        if (err){
            console.log(err)
            res.json({err})
        } else {
            console.log(results)

            const sql = "SELECT * FROM messages INNER JOIN user ON user._id = messages.user_id ORDER BY messages.message_id"
            db.query(sql, (err, results, fields) => {
                if (err){
                    console.log(err)
                    res.json({err})
                } else {
                    console.log(results)
                    res.json({message: "Messages récupérés", results})
                }
            })
        }
    })
}


exports.getMessages = (req, res) => {
    const sql = "SELECT * FROM messages INNER JOIN user ON user._id = messages.user_id ORDER BY messages.message_id"
    db.query(sql, (err, results, fields) => {
        if (err){
            console.log(err)
            res.json({err})
        } else {
            console.log(results)
            res.json({message: "Messages récupérés", results})
        }
    })
}


exports.deleteMessage = (req, res) => {
    const id = req.params.id

    const sql = "SELECT imageUrl FROM messages WHERE message_id = ?"
    db.query(sql, id, (err, results, fields) => {
        if (err){
            console.log(err)
        } else {
            const fileName = results[0].imageUrl.split("/images/")[1]
            fs.unlink(`images/${fileName}`, fsResultHandler)
            console.log(results);

            const sql = "DELETE FROM messages WHERE post_id = ?"
            db.query(sql, id, (err, results, fields) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(results);

                    const sql = "DELETE FROM messages WHERE message_id = ?"
                    db.query(sql, id, (err, results, fields) => {
                        if (err){
                            console.log(err)
                        } else {
                            console.log(results)
        
                            const sql = "SELECT * FROM messages INNER JOIN user ON user._id = messages.user_id ORDER BY messages.message_id"
                            db.query(sql, (err, results, fields) => {
                                if (err){
                                    console.log(err)
                                    res.json({err})
                                } else {
                                    console.log(results)
                                    res.json({message: "Messages récupérés", results})
                                }
                            })
                        }
                    })
                }
            })            
        }
    })
}