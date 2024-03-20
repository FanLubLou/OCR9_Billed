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

  })
})
