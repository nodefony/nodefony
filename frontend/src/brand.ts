/**
 * Logo de la page — IMPORTÉ depuis le paquet `nodefony`, source unique du
 * logo officiel. C'est l'idiome à suivre pour toute image du front
 * (`import x from "./x.png"`, ou `url(./x.png)` en CSS) : Vite la sert en
 * développement, puis au build de production l'inscrit dans le bundle si elle
 * pèse moins de 4 Ko, ou l'émet en fichier à empreinte sinon.
 *
 * Le SVG, et non le PNG (`nodefony/assets/nodefony-logo.png`) : le logo du
 * hero est l'élément le plus grand de la page (LCP). Vectoriel, il reste net
 * à toute densité d'écran ; sous 1 Ko, il part dans le bundle et ne coûte
 * aucune requête — en PNG, le navigateur ne le découvrait qu'après le
 * JavaScript, et le chargement mobile perdait des points à Lighthouse.
 *
 * Pour poser ta marque : place ton image à côté (`./logo.svg`) et importe-la
 * ici à la place.
 */
import logoUrl from "nodefony/assets/nodefony-logo.svg";

export const NODEFONY_LOGO: string = logoUrl;
