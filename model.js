import { Schema, model } from "mongoose"

// Entity

const schemaBalade = new Schema({
    identifiant : String,
    adresse : {type : String, required : true },
    code_postal : String,
    parcours : [String],
    url_image: String,
    copyright_image : String,
    legende : String,
    categorie : {type : String, required : true },
    nom_poi : {type : String, required : true },
    date_saisie : String,
    mot_cle : [String],
    ville : String,
    texte_intro : String,
    texte_description : String,
    url_site : String,
    fichier_image : {
        thumbnail : Boolean,
        file_name : String,
        format : String,
        width : String,
        mimetype : String,
        etag : String,
        id : String,
        last_synchronized : Date,
        color_summary : [],
        height : String
    },
    geo_shape : {
        type : {type : String},
        geometry : {
            coordinates : [Number],
            type : {type : String}
        },
        properties : {},
    },
    geo_point_2d : {
        lon : Number,
        lat : Number
    }
})

const Balade = model("balades", schemaBalade);
// "balades" nom de la Collection dans la base Paris (mis dans la connexion)

export {Balade};