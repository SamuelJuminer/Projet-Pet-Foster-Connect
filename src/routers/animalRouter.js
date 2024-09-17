import { Router } from "express";

import { animalController } from "../controllers/animalController.js";
import { catchErrors } from "../middlewares/catchErrors.js";
import { auth } from "../middlewares/auth.js";
import { isRole } from "../middlewares/isRole.js";
import { Demande } from "../models/Demande.js";

const animalRouter = Router();

//* Rendu de la page avec tout les animaux disponibles
animalRouter.get('/animaux', catchErrors(animalController.availableAnimalsList));

//* Rendu de la page avec les animaux correspondant à la recherche
animalRouter.post('/animaux', catchErrors(animalController.getSearched));

//* Rendu de la page de détail d'un animal
animalRouter.get('/animaux/:id(\\d+)', catchErrors(animalController.detailAnimal));

//* Route de demande d'accueil d'un animal par un.e user
animalRouter.post('/animaux/:id(\\d+)/faire-une-demande',[auth,isRole.famille] , catchErrors(animalController.hostRequest));

animalRouter.post('/animaux/nouveau-profil', [auth,isRole.association], catchErrors(animalController.addAnimal));



export { animalRouter };
