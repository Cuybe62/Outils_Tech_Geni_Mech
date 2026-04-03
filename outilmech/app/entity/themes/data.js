import { Theme } from "./theme";
import math from "@/public/img/Math.png";
import Physique from "@/public/img/Physique.png";
import Conception from "@/public/img/Conception.png";
import { id } from "@/public/utis";

export const lstTheme = [
  new Theme(
    id(),
    "Mathématique",
    "Outils de math pour l'ingénirie et la résolution d'équation",
    math,
  ),

  new Theme(
    id(),
    "Physique",
    "Outils pour la compréhension des concepts de la cinématique, dynamique et les autres",
    Physique,
  ),
  new Theme(
    id(),
    "Conception",
    "Outils et ressources pour facilité la modélisation et la conception de projet mécanique ",
    Conception,
  ),
];
