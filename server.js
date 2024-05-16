import express from "express";
import route from "./router.js"
// tout le code écrit dans le fichier router.js est stocker dans une variable route
import { connect } from "mongoose" //tree shaking

connect("mongodb+srv://romiokaa:Maissaa21@cluster0.6jjhnz6.mongodb.net/Paris")
    .then(function(){
        console.log("connexion mongo réussie")
    })
    .catch(function(err){
        console.log(new Error(err))
    })

const app = express();
const PORT = 1235;

app.use(express.json());
app.use(route);

// créer deux fichiers en + 
// fichier model.js => ajouter les model/schema
// router.js => app.get(...)

app.listen(PORT, function(){
    console.log(`serveur express écoute sur le port ${PORT}`)
})
// créer un serveur qui écoute sur le PORT http://localhost:1235