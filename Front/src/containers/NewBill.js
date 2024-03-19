import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    // Initialisation des propriétés de l'instance avec les paramètres passés au constructeur
    
    this.document = document
    this.onNavigate = onNavigate
    this.store = store

    // Sélection du formulaire de création de note de frais et ajout d'un écouteur d'événement de soumission
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)

    // Sélection de l'élément de fichier et ajout d'un écouteur d'événement de changement
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    
    // Initialisation des propriétés pour le fichier, l'URL du fichier, le nom du fichier et l'ID de la note de frais
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    // Initialisation de la déconnexion avec l'instance Logout
    new Logout({ document, localStorage, onNavigate })
  }
  handleChangeFile = e => {
    e.preventDefault()
    // Récupération du fichier sélectionné
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    const filePath = e.target.value.split(/\\/g)
    const fileName = filePath[filePath.length - 1]
    
    // Création des données du formulaire à envoyer
    const formData = new FormData()
    const email = JSON.parse(localStorage.getItem("user")).email
    formData.append('file', file)
    formData.append('email', email)

    //Issue 3
    //Empêcher l'import de justificatif qui ne soient pas JPG, JPEG ou PNG.
    const allowedExtensions = ['jpg', 'jpeg', 'png']
    const fileExtension = fileName.split('.').pop().toLowerCase()
    if (!allowedExtensions.includes(fileExtension)) {
      alert('Le fichier doit être au format JPG, JPEG ou PNG.')
      fileInput.value = '' // Effacer le champ de fichier pour éviter de soumettre le fichier invalide
      return
    }

    // Envoi des données de la note de frais au serveur et gestion de la réponse  
    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({fileUrl, key}) => {
        console.log(fileUrl)
        this.billId = key
        this.fileUrl = fileUrl
        this.fileName = fileName
      }).catch(error => console.error(error))
  }
  handleSubmit = e => {
    e.preventDefault()

    //Aide au deboggage
    // Affiche le contenu du champ de date dans la console du navigateur pour aider au débogage. Cela peut être utile pour vérifier que la valeur du champ de date est correctement récupérée avant de l'utiliser pour créer la note de frais. 
    console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
   
    // Récupération des données du formulaire
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    // Mise à jour de la note de frais
    this.updateBill(bill)
    // Redirection vers la page des notes de frais
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // Mise à jour de la note de frais (updateBill) :
  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}