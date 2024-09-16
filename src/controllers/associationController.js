/*
import Joi from 'joi';
import { Card, List } from '../models/index.js';
import { hexadecimalColorSchema } from './JOI-VALIDATE-HEX-STRING.js';
*/

import { Association, Animal, Demande, Espece, Famille, Tag, Utilisateur } from "../models/Models.js";
import { Op } from "sequelize";


const associationController = {
    
    //* Liste des associations
    async getAll(req, res) {
        // Récupérer toutes les associations en BDD
        const associations = await Association.findAll({
            include :  [ 'images_association' ]
        });
        
        const especes = await Espece.findAll();
        
        // Envoyer une réponse
        res.render("listeAssociations",{ associations, especes });
    },
    
    //* Liste des associations RECHERCHEES
    async getSearched(req,res) {
        const {
            espece,
            dptSelect,
            shelterNom
        } = req.body;
        
        const especes = await Espece.findAll();

        const associations = await Association.findAll({
            include : [ 
                'images_association',
                { model : Animal, as : "pensionnaires", include : { model : Espece, as : "espece" } }],
                where : {
                    nom : (req.body.nom) ? (req.body.shelterNom) : { [Op.ne]: null },
                    code_postal : (req.body.dptSelect) ? { [Op.startsWith] : req.body.dptSelect } : { [Op.ne] : null },
                    '$pensionnaires.espece.nom$' : (req.body.espece ) ? { [Op.like] : req.body.espece } || { [Op.in] : req.body.espece } : { [Op.ne] : null}
                }
            });

            return res.render("listeAssociations", { associations, especes });
        },
        
    /* Détails d'une Association */
    async getOne(req, res, next) {
        // * Est-ce suffisant pour garantir une sécurité ?
        const associationId = req.params.id;
        // Récupérer l'association' en BDD (avec potentiellement ses tags)
        const association = await Association.findByPk(associationId, {
            include : [
                'pensionnaires',
                'images_association',
                'identifiant_association',
                { model : Animal, as : "pensionnaires",
                include: ['images_animal', 'espece'] }
            ]
        });
        // Si l'associaiton n'existe pas (ID=90000 => null) ==> 404
        if (!association) {
            return next();
        }
        // Envoyer une réponse
        res.render("detailAssociation", { association });
    },
    
    /* Création d'une association (à mettre dans le login/signup) */
    async store(req,res) {
    },
    
    /* Supprimer une association */
    async destroy(req, res, next) {
        
        //*Vérification que l'utilisateur.ice connecté.e est bien cellui qui doit être supprimé.e
        //* (on ne veut pas que n'importe qui puisse supprimer un compte asso)
        
        if (!(parseInt(req.session.id)===parseInt(req.params.id))){
            
            res.status=401;
            return next(new Error('Unauthorized'))
            
        }
        
        // Récupérer l'Id de l'association à supprimer
        const associationId = req.params.id;
        
        const association = await association.findByPk(associationId);
        
        if (!association) {
            // Si pas entier ou pas existant dans la BDD => 404
            return next();
        }
        
        await association.destroy();
        
        // Sinon on supprime et on renvoie une 204 avec un body vide.
        res.status(204).end();
    },
    
    /* Lister les animaux d'une association */
    async getAllAnimals(req, res, next) {
        // * Est-ce suffisant pour garantir une sécurité ?
        const associationId = req.params.id;
        // Récupérer l'association' en BDD (avec potentiellement ses tags)
        const association = await Association.findByPk(associationId, {
            include: ['animaux']
        });
        // Si l'associaiton n'existe pas (ID=90000 => null) ==> 404
        if (!association) {
            return next();
        }
        // Envoyer une réponse
        res.render("detailAssociation",{ association });
    },
    
    /* Ajouter un animal à une asso */
    async addAnimal(req,res, next) {
        const associationId = req.params.id;
        const association = await Association.findByPk(associationId);
        
        if(!association) {
            return next();
        }
        
        await association.addAnimal(newAnimal);
        /* Sequelize Lazy Loading ? (Je crois) */
    },
    
    /* Afficher le profil (dashboard) d'une association */
    async displayDashboard(req,res,next){
        
        //! A REMPLACER PAR REQ.SESSION.USERID !!
        const associationId = 1;
        
        const association = await Association.findByPk(associationId);
        
        res.render('profilAssociationInfos', { association });
    },
    
    /* MàJ Asso */
    async update(req,res) {
        /*  const associationId = req.params.id; */
        //! A REMPLACER PAR REQ.SESSION.USERID !!
        const associationId = 1;
        const association = await Association.findByPk(associationId);
        
        if (!association) {
            return next();
        }
        
        // Element à Update
        const { nom, responsable, rue, commune, code_postal, pays, siret, telephone } = req.body;
        
        const updatedAssociation = await association.update({
            nom : nom || association.nom,
            responsable : responsable || association.responsable,
            rue : rue || association.rue,
            commune : commune || association.commune,
            code_postal : code_postal || association.code_postal,
            pays : pays || association.pays,
            siret : siret || association.siret,
            telephone : telephone || association.telephone,
        });
        
        console.log('success')
        console.log(updatedAssociation);
        //! A REMPLACER PAR REQ.SESSION.USERID !!
        res.redirect("/associations/profil")
        
    },
    
    /* Afficher les demandes en cours */
    async dashboardRequests(req,res) {
        /*  const associationId = req.params.id; */
        //! A REMPLACER PAR REQ.SESSION.USERID !!
        const associationId = 1;
        const association = await Association.findByPk(associationId);
        
        if (!association) {
            return next();
        }
        
        const requestedAnimals = await Animal.findAll({
            where : [
                { '$refuge.id$' : associationId },
                { '$demandes.id$':  { [Op.not] : null }}
            ],
            include: [ "demandes", "refuge" ],
        })
        
        res.render('profilAssociationDemande', { association, requestedAnimals });
    },
    
    /* Afficher les détails d'une demande en cours */
    async dashboardRequestsDisplayOne(req,res) {
        const associationId = 1;
        const association = await Association.findByPk(associationId);
        
        if (!association) {
            return next();
        }
        
        const requestId = req.params.id;
        
        const request = await Demande.findOne({
            where : { id :requestId } });
            
            const famille = await Famille.findOne({
                where: { id : request.famille_id},
                include : ['identifiant_famille']
            })
            
            const animal = await Animal.findOne({
                where : { id : request.animal_id},
                include : ['espece', 'tags', 'images_animal']
            })
            /* 
            console.log('Demande' + request )
            console.log('Famille' + famille);
            console.log("Animal : " + animal ); */
            
            res.render('profilAssociationDemandeSuivi', { association, request, famille, animal })
        },
        
    async denyRequest(req,res) {
        const requestId = req.params.id;
        
        const request = await Demande.findByPk(requestId);
        
        const updatedRequest = await request.update({
            statut_demande : 'Refusée'
        });
        
        console.log(updatedRequest);
        await updatedRequest.save();
        
        res.redirect('/associations/profil/demandes/' + requestId)
    },
    
    async approveRequest(req,res) {
        const requestId = req.params.id;
        
        const request = await Demande.findByPk(requestId);
        
        await request.update({
            statut_demande : 'Validée'
        });
        await request.save();
        
        
        const otherRequests = await Demande.findAll({
            where :{
                animal_id:request.animal_id,
                [Op.not]: {
                    id : parseInt(req.params.id)
                }
            }
        });

        
        for (const demande of otherRequests) {
            
            await demande.update({
                statut_demande:"Refusée"
            });
            
            await demande.save();
            
        }
        
        const animal = await Animal.findByPk(request.animal_id);
        await animal.update({famille_id:request.famille_id});
        await animal.save();
        
        res.redirect('/associations/profil/demandes/' + requestId)
    },
    
    async dashboardAnimaux(req,res,next){
        
        //! A REMPLACER PAR REQ.SESSION.USERID !!
        const associationId = 1;
        
        const animals = await Animal.findAll({
            include: [
                'espece',
                'images_animal',
                {
                    model : Association,
                    as : 'refuge',
                    where: {
                        id : associationId,
                    },
                },
                
            ]
        });
        
        /*
        animaux : tableau d'animaux contenant notamment un objet espece,
        un tableau images_animal, un objet refuge, un object accueillant,
        un tableau tags et un tableau demande
        */
        
        res.render('profilAssociationAnimauxListe',{ animals });
    },
    async dashboardAnimauxSuivi (req, res ,next) {
        //! A REMPLACER PAR REQ.SESSION.USERID !!
        const associationId = 1;
        
        const animals = await Animal.findAll({
            where : {statut:'Accueilli'},
            include : [
                'espece',
                'images_animal',
                {
                    model : Association,
                    as : 'refuge',
                    where: {
                        id : associationId,
                    },  
                },
                'tags',
                {
                    model : Famille,
                    as :'accueillant',
                    include : {
                        model: Utilisateur,
                        as :'identifiant_famille',
                        attributes : ['id','email']
                    }
                }
                
            ]
        })
        
        //res.send(animals);
        res.render('profilAssociationAnimauxSuiviAccueil',{ animals });
        
    },
    
    //* Rendu de la page créer un profil animal
    //! La soumission du formulaire en POST est sur le animalController
    async dashboardAnimauxAjouter (req, res, next) {
        
        const especes = await Espece.findAll();
        const tags = await Tag.findAll();
        res.render('profilAssociationAnimauxAjouter', {especes,tags});    
    },
    
    async dashboardAnimalDetail (req,res,next) {
        //! A RECUPERER DEPUIS LA SESSION EN PROD!!!!
        const associationId=1;
        
        
        const animal = await Animal.findByPk(
            req.params.animalId,
            {
                include : [
                    'espece',
                    'images_animal',
                    'tags',
                    'refuge',
                    {
                        model : Famille,
                        as :'accueillant',
                        include : {
                            model: Utilisateur,
                            as :'identifiant_famille',
                            attributes : ['id','email']
                        }
                    },
                    'demandes'
                    
                ]
            });

            if (animal) {

                if (!(associationId===animal.refuge.id)){
                    return next();
                }
                
            } else {

                return next();
                
            }

            
            // res.send(animal);
            res.render('profilAssociationAnimauxDetail', {animal});
            
            
    }
        
};
    
export { associationController };
    
