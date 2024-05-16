import { Router } from  "express";
import { Balade } from "./model.js"; //find, updateOne, aggregate, deleteOne
import { isValidObjectId } from "mongoose"

const router = Router();

router.get('/all', async function (req, rep){
    const balades = await Balade.find()
    rep.json(balades);
});

router.get('/id/:id', async (req, rep) => {
    try {
        const balade = await Balade.findById(req.params.id);
        if (!balade) {
            return rep.status(404).json({ error: 'Balade non trouvée.' });
        }
        rep.json(balade);
    } catch (error) {
        rep.status(500).json({ error: 'Erreur lors de la récupération de la balade.' });
    }
});

router.get('/search/:search', async (req, rep) => {
    try {
        const search = req.params.search;
        const balades = await Balade.find({
            $or: [
                { nom_poi: new RegExp(search, 'i') },
                { texte_intro: new RegExp(search, 'i') }
            ]
        });
        rep.json(balades);
    } catch (err) {
        rep.status(500).json({ message: err.message });
    }
});

router.get('/site-internet', async (req, rep) => {
    try {
        const balades = await Balade.find({ url_site: { $ne: null } });
        rep.json(balades);
    } catch (err) {
        rep.status(500).json({ message: err.message });
    }
});

router.get('/mot-cle', async (req, rep) => {
    try {
        const balades = await Balade.find({ 'mot_cle.5': { $exists: true } });
        rep.json(balades);
    } catch (err) {
        rep.status(500).json({ message: err.message });
    }
});

router.get ("/publie/:annee", async function(req, rep){
const annee = req.params.annee;
const reponse = await Balade.find({
    date_saisie: { $regex: annee, $options: 'i' }
}).sort({ date_saisie: 1 })
    rep.json(reponse)
});

router.get('/arrondissement/:num_arrondissement', async (req, rep) => {
    try {
        const numArrondissement = req.params.num_arrondissement;
        if (isNaN(numArrondissement) || numArrondissement.length !== 2) {
            return rep.status(400).json({ error: "Numéro d'arrondissement invalide." });
        }
        const regex = new RegExp(numArrondissement + '$');
        console.log(regex)
        const count = await Balade.countDocuments({ code_postal: { $regex: regex } });
        rep.json({ count });
    } catch (error) {
        console.log(error);
        rep.status(500).json({ error: 'Erreur lors du comptage des balades.' });
    }
});

router.get('/synthese', async (req, rep) => {
    try {
        const result = await Balade.aggregate([
            {
                $group: {
                    _id: { $substr: ["$code_postal", 3, 2] },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        rep.json(result);
    } catch (error) {
        rep.status(500).json({ error: 'Erreur lors de la récupération de la synthèse par arrondissement.' });
    }
});

router.get('/categories', async (req, rep) => {
    try {
        const categories = await Balade.distinct('categorie');
        rep.json(categories);
    } catch (err) {
        rep.status(500).json({ message: err.message });
    }
});

router.post("/add", async function(req, rep){
    const balades = req.body ; // l'objet va être envoyé dans la requete 
    if (!balades.nom_poi || !balades.adresse || !balades.categorie) {
        return rep.status(400).json({ message: "Les champs 'nom_poi', 'adresse' et 'categorie' sont obligatoires." });
    };

    const nouvelBalade = new Balade(balades);
    try{
        const reponse = await nouvelBalade.save();// insertOne()
        rep.json(reponse); 
    } catch (err) {
        console.log(error)
        rep.status(500).json({ message : err.message });
    }
});

router.put('/add-mot-cle/:id', async (req, rep) => {
    try {
        const { id } = req.params;
        const { mot_cle } = req.body;

        if (!mot_cle) {
            return rep.status(400).json({ error: 'Le mot clé est obligatoire.' });
        }

        const balade = await Balade.findById(id);

        if (!balade) {
            return rep.status(404).json({ error: 'Balade non trouvée.' });
        }

        if (balade.mot_cle.includes(mot_cle)) {
            return rep.status(400).json({ error: 'Le mot clé existe déjà.' });
        }

        balade.mot_cle.push(mot_cle);
        await balade.save();

        rep.status(200).json(balade);
    } catch (error) {
        console.log(error);
        rep.status(500).json({ error: 'Erreur lors de l\'ajout du mot clé.' });
    }
});

router.put('/update-one/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const miseAJour = req.body;

        const balade = await Balade.findByIdAndUpdate(id, miseAJour, { new: true });

        if (!balade) {
            return res.status(404).json({ error: 'Balade non trouvée.' });
        }

        res.status(200).json(balade);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour de la balade.' });
    }
});

router.put('/update-many/:search', async (req, res) => {
    try {
        const { search } = req.params;
        const { nom_poi } = req.body;

        if (!nom_poi) {
            return res.status(400).json({ error: 'Le nom_poi est obligatoire.' });
        }

        const regex = new RegExp(search, 'i'); // Expression régulière insensible à la casse

        const balades = await Balade.updateMany({ texte_description: { $regex: regex } }, { nom_poi });

        if (balades.nModified === 0) {
            return res.status(404).json({ error: 'Aucune balade à mettre à jour.' });
        }

        res.status(200).json({ message: 'Balades mises à jour avec succès.' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour des balades.' });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const balade = await Balade.findByIdAndDelete(id);

        if (!balade) {
            return res.status(404).json({ error: 'Balade non trouvée.' });
        }

        res.status(200).json({ message: 'Balade supprimée avec succès.' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression de la balade.' });
    }
});

export default router ;