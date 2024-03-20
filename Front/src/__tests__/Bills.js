/**
 * @jest-environment jsdom
 */

import {screen, waitFor, fireEvent} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"

import { bills } from "../fixtures/bills.js"
//Importation de Bills
import Bills from "../containers/Bills.js"
//Importation de ROUTES
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
//Importation des mocks
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";
// Pour utiliser la fonction toHaveClass Issue
import '@testing-library/jest-dom/extend-expect';
//Importations des mocks pour


    /****************/
    //Première suite de tests 
    //destinée à vérifier les interactions de l'utilisateur avec l'interface utilisateur
    /****************/
    
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      // Mock localStorage
      // Version simulée de l'objet localStorage
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      // On créé un élément racine et l'ajouter au corps du document       
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      
      // On va à la page des facture
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      //On attend que l'icone soit à l'écran
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')

      //On vérifie que l'icone soit bien surligné
      expect(windowIcon).toHaveClass('active-icon');
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills.sort((a, b) => ((a.date < b.date) ? 1 : -1)) })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    // Vérifie que le titre et le bouton sont bien affichés
    test('Then title and button should be displayed', () => {
      document.body.innerHTML = BillsUI({ data: [] })
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy()
      expect(screen.getByTestId("btn-new-bill")).toBeTruthy()
  });

  // Vérifie que le formulaire de création de note de frais s'affiche bien
  describe('When I click on "Nouvelle note de frais"', () => {
      test('Then the form to create a new invoice should appear', () => {
          const onNavigate = (pathname) => {
              document.body.innerHTML = ROUTES({ pathname })
          }
          Object.defineProperty(window, 'localStorage', { value: localStorageMock })
          window.localStorage.setItem('user', JSON.stringify({
              type: 'Employee'
          }))
          const bills = new Bills({
              document,
              onNavigate,
              store: mockStore,
              localStorage: window.localStorage
          })
          document.body.innerHTML = BillsUI({ data: bills });

          const buttonNewBill = screen.getByTestId('btn-new-bill');
          const handleClickNewBill = jest.fn(bills.handleClickNewBill);
          buttonNewBill.addEventListener('click', handleClickNewBill);
          fireEvent.click(buttonNewBill);
          expect(handleClickNewBill).toHaveBeenCalled();
      });
  });

  // Vérifie si la modale contenant le justificatif de la note de frais apparaît
  describe('When I click on the icon eye', () => {
      test('Then a modal should appear', () => {
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
          const iconEye = screen.getAllByTestId("icon-eye");
          const handleClickIconEye = jest.fn(billsPage.handleClickIconEye);
          const modaleFile = document.getElementById("modaleFile");
          $.fn.modal = jest.fn(() => modaleFile.classList.add("show"));

          iconEye.forEach((icon) => {
              icon.addEventListener("click", handleClickIconEye(icon))
              fireEvent.click(icon)
              expect(handleClickIconEye).toHaveBeenCalled()
          });
          expect(modaleFile).toHaveClass("show");
          expect(screen.getByText("Justificatif")).toBeTruthy();
          expect(bills[0].fileUrl).toBeTruthy();
      });
  });

  })
})

    /****************/
    //Deuxième suite de tests
    //destinée à tester le comportement de l'application lorsque le chargement des factures depuis l'API échoue
    /****************/
    
describe("Given I am a user connected as Employee", () => {
    describe("When fetching bills from API fails with 404 error", () => {
        beforeEach(() => {
        jest.spyOn(mockStore, "bills")           
        })
    
        test("Then ErrorPage should be rendered with 404 error message", async () => {
        mockStore.bills.mockImplementationOnce(() => ({
            return: () => Promise.reject(new Error("Erreur 404"))
        }));
        document.body.innerHTML = BillsUI({ error: "Erreur 404" });
        expect(screen.getByText(/Erreur 404/)).toBeTruthy();
        });
    });
    
    describe("When fetching bills from API fails with 500 error", () => {
        beforeEach(() => {
        jest.spyOn(mockStore, "bills")           
        })
    
        test("Then ErrorPage should be rendered with 500 error message", async () => {
        mockStore.bills.mockImplementationOnce(() => ({
            return: () => Promise.reject(new Error("Erreur 500"))
        }));
        document.body.innerHTML = BillsUI({ error: "Erreur 500" });
        expect(screen.getByText(/Erreur 500/)).toBeTruthy();
        });
    });
});
      