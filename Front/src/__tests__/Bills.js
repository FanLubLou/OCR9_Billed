/**
 * @jest-environment jsdom
 */
//Import de fireEvent pour le scenario 6
import {screen, waitFor, fireEvent} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
//Import de Bills pour le scenario 6
import Bills from "../containers/Bills.js"
//Import de ROUTES
import { ROUTES_PATH, ROUTES} from "../constants/routes.js";
//Import des mocks
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";
import '@testing-library/jest-dom';

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills.sort((a, b) => ((a.date < b.date) ? 1 : -1)) })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
      
    // Scenario 5: Vérifie que le titre et le bouton sont bien affichés
    test('Then title and button should be displayed', () => {
      document.body.innerHTML = BillsUI({ data: [] })
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy()
      expect(screen.getByTestId("btn-new-bill")).toBeTruthy()
  });

  // Scenario 6: Vérifie que le formulaire de création de note de frais s'affiche bien
  describe('When I click on "Nouvelle note de frais"', () => {
      test('Then the form to create a new invoice should appear', () => {
          //onNavigate gère la navigation dans l'application lorsqu'un utilisateur clique sur un lien ou un bouton
          const onNavigate = (pathname) => {
              document.body.innerHTML = ROUTES({ pathname })
          }
          // on remplace la méthode localStorage de l'objet window par une version mockée (localStorageMock). 
          // Cela permet de simuler le comportement de localStorage dans un environnement de test.
          Object.defineProperty(window, 'localStorage', { value: localStorageMock })
          window.localStorage.setItem('user', JSON.stringify({
              type: 'Employee'
          }))
          //Crée une instance de la classe Bills.
          const bills = new Bills({
              document,
              onNavigate,
              store: mockStore,
              localStorage: window.localStorage
          })
          //On inject le HTML via la méthode BillsUI
          document.body.innerHTML = BillsUI({ data: bills });
          //On récupère le bouton "Nouvelle note de frais" sur lequel on met un écouteurd evts
          const buttonNewBill = screen.getByTestId('btn-new-bill');
          
          //Crée un faux appel de fonction pour la méthode handleClickNewBill de l'objet bills
          const handleClickNewBill = jest.fn(bills.handleClickNewBill);
          buttonNewBill.addEventListener('click', handleClickNewBill);
          //On déclenche un evt de clic
          fireEvent.click(buttonNewBill);
          //On verifie que la fonction est bien appelée.
          expect(handleClickNewBill).toHaveBeenCalled();
      });
    //Scenario 7
    // Vérifie si la modale contenant le justificatif de la note de frais apparaît
    describe('When I click on the icon eye', () => {
      test('Then a modal should appear', () => {
        // Le début est le même que le scenario6. 
        // On simule le comportement du localStorage. On créée une instance de la classe Bills et on injecte grâce à BillsUI
        // 
          const onNavigate = (pathname) => {
              document.body.innerHTML = ROUTES({ pathname })
          };
          Object.defineProperty(window, 'localStorage', { value: localStorageMock })
          window.localStorage.setItem('user', JSON.stringify({
              type: 'Employee'
          }));
          const billsPage = new Bills({
              document,
              onNavigate,
              store: mockStore,
              localStorage: window.localStorage
          });
          document.body.innerHTML = BillsUI({ data: bills });
        // On va ici sélectionner tous les elts icon-eye, surlesquels on va simuler le clic sur l'icône de l'oeil.
          const iconEye = screen.getAllByTestId("icon-eye");
          const handleClickIconEye = jest.fn(billsPage.handleClickIconEye);
        // On va selectionner la modale sur laquelle on va ajouter la classe "show".
          const modaleFile = document.getElementById("modaleFile");
          $.fn.modal = jest.fn(() => modaleFile.classList.add("show"));
        //Ici, pour chaque icone, on ajoute un gestionnaire d evts. On déclenche la fonction handlClickIconEye et on verifie si elle est appelée.
          iconEye.forEach((icon) => {
              icon.addEventListener("click", handleClickIconEye(icon))
              fireEvent.click(icon)
              expect(handleClickIconEye).toHaveBeenCalled()
          });
        //On vérifie si la classe show a ete ajoutee, si 'justificatif' est présent dans l'interface 
        // et si l'URL du fichier associé à la première facture existe
          expect(modaleFile).toHaveClass("show");
          expect(screen.getByText("Justificatif")).toBeTruthy();
          expect(bills[0].fileUrl).toBeTruthy();
      });
  });
    
    
    
  });

  })
})
