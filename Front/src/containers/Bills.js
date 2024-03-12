//définit les chemins des différentes routes de l'application
import { ROUTES_PATH } from '../constants/routes.js'
// fonctions utilisées pour formater les dates et status de l'application
import { formatDate, formatStatus } from "../app/format.js"
// Gestion de la déconnexion
import Logout from "./Logout.js"



export default class {
  //Constructeur de classe avec les propriétés suivantes
  constructor({ document, onNavigate, store, localStorage }) {
    //Assigne les propriétés passées au constructeur aux propriétés de l'instances de la classe.
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    //Sélectionne le bouton avec l'attribut data-testid égal à btn-new-bill dans le document HTML.
    //Si le bouton existe, un écouteur d'évènements est ajouté pour gérer le clic sur ce bouton.
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)
    // Selectionne tous les éléments <div> avec l'attribut data-testid égal à "icon-eye"
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    // La méthode handleClickIconEye est appélée lorsque l'icône "iconEye" est cliquée.
      if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon))
    })
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }
  // La méthode récupère l’URL de la facture associée à l’icône, calcule la largeur de l’image et affiche la facture dans une fenêtre modale.
  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
    $('#modaleFile').modal('show')
  }
 //La méthode récupère les factures à partir du magasin (store) et formate les dates et les statuts. Si une erreur se produit lors du formatage, elle gère l’exception et renvoie les données non formatées.
  getBills = () => {
    if (this.store) {
      return this.store
      .bills()
      .list()
      .then(snapshot => {
        const bills = snapshot
          //  Issue 1
          //  Trie par date (du plus récent au plus ancien)
          .sort((a, b) => (a.date < b.date ? 1 : -1))
          .map(doc => {
            try {
              return {
                ...doc,
                date: formatDate(doc.date),
                status: formatStatus(doc.status)
              }
            } catch(e) {
              // if for some reason, corrupted data was introduced, we manage here failing formatDate function
              // log the error and return unformatted date in that case
              console.log(e,'for',doc)
              return {
                ...doc,
                date: doc.date,
                status: formatStatus(doc.status)
              }
            }
          })
          console.log('length', bills.length)
        return bills
      })
    }
  }
}
