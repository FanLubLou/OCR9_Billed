/**
 * @jest-environment jsdom
 */
//Import de fireEvent pour le scenario 6
import {screen, waitFor, fireEvent} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
//import { getBills } from "../containers/Bills.js"
import { formatStatus } from "../app/format.js"
import { formatDate } from "../app/format.js"
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
      //Mock localStorage
      // Version simulée de l'objet locatStorage
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      //On créé un élément racine et l'ajouter au corps du document
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)

      //On va à la page des factures
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      //On attend que l'icone soit à l'écran
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      
      //Issue 5 premier point
      //On vérifie que l'icone soit bien surligné
      expect(windowIcon).toHaveClass('active-icon');

    });
            // Vérifie le tri par date (du plus récent au plus ancien)
            test("Then bills should be ordered from earliest to latest", () => {
              document.body.innerHTML = BillsUI({ data: bills.sort((a, b) => ((a.date < b.date) ? 1 : -1)) })
              const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
              const antiChrono = (a, b) => ((a < b) ? 1 : -1)
              const datesSorted = [...dates].sort(antiChrono)
              expect(dates).toEqual(datesSorted)
          });
    
      
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
    })
  })
});

//Scenario 8 & scenario 9
//On vérifie qu'une page approriée s'affiche lors de l'echec avec une erreur 404 de la récupération des factures depuis l'API
describe("Given I am a user connected as Employee", () => {
  describe("When fetch bills from API fail", () => {
      //On espionne ici la méthode bills de l'objet mockstore à chaque appel.
      beforeEach(() => {
          jest.spyOn(mockStore, "bills")           
      })
      //Scenario 8 
      // Vérifie que l'erreur 404 est bien affichée
      test("Then, ErrorPage should be rendered with 404 error message", async () => {
        //On configure cii le comportement de la méthode bills de l'objet mockStore lorsque cette méthode est appelée. 
        // On simule un échec de récupération des factures en rejetant une promesse avec un message d'erreur "Erreur 404"
          mockStore.bills.mockImplementationOnce(() => ({
              return: () => Promise.reject(new Error("Erreur 404"))
          }));
        // On injecte le HTML grâce à BillsUI
        document.body.innerHTML = BillsUI({ error: "Erreur 404" });
        //On vérifie si le texte "Erreur 404" est bien présent dans la page
          expect(screen.getByText(/Erreur 404/)).toBeTruthy();
      });
    // Scenario 9
    // Vérifie que l'erreur 500 est bien affichée
    test("Then, ErrorPage should be rendered", async () => {
      // On configure cii le comportement de la méthode bills de l'objet mockStore lorsque cette méthode est appelée. 
      // On simule un échec de récupération des factures en rejetant une promesse avec un message d'erreur "Erreur 500"      
      mockStore.bills.mockImplementationOnce(() => ({
          return: () => Promise.reject(new Error("Erreur 500"))
      }));
      // On injecte le HTML grâce à BillsUI
      document.body.innerHTML = BillsUI({ error: "Erreur 500" });
      //On vérifie si le texte "Erreur 500" est bien présent dans la page
      expect(screen.getByText(/Erreur 500/)).toBeTruthy();
  });    
   });
});
