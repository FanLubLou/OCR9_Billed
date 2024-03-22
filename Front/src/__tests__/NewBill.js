/**
 * @jest-environment jsdom
 */


//Ajout de la fonction fireEvent en plus de la fction screen 
import { screen, fireEvent } from "@testing-library/dom"

//Ajout de ROUTES dans les imports pour les tests 
import { ROUTES } from "../constants/routes.js";
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
// Import des mocks
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";

//Scenarios 10 et 11
describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page", () => {
      // On définit ici les conditions initiales avant chaque test
      // On définit un mock pour localStorage en remplaçant la propriété localStorage de l'objet window par un objet localStorageMock
      // On stocke les informations de l'utilisateur (ici employee) connecté dans le localStorage
      // 
      beforeEach(() => {
          Object.defineProperty(window, 'localStorage', { value: localStorageMock });
          window.localStorage.setItem('user', JSON.stringify({
              type: 'Employee'
          }));
          document.body.innerHTML = NewBillUI();
      })
        //Scenario 10: création d une nouvelle note de frais, le fichier est bien ajouté
      test("Then the handleChangeFile() function is called when a file is added", () => {
          const newBill = new NewBill({ document, onNavigate: {}, store: mockStore, localStorage: {} });
          const handleChange = jest.fn((e) => newBill.handleChangeFile(e));
          const inputFile = screen.getByTestId('file');
          inputFile.addEventListener('change', handleChange);
          fireEvent.change(inputFile, {
              target: {
                  files: [new File(['test'], 'test.png', { type: 'image/png' })]
              }
          });
          expect(handleChange).toHaveBeenCalled();
          expect(inputFile.files[0].name).toBe('test.png');
      });
      //Scenario 11: La note de frais est ajoutée plus redirection vers la page des notes de frais
      // Test intégration POST
        // Vérifie que la nouvelle note de frais peut être envoyée
        describe('When I am on NewBill Page, i fill the form and i click submit', () => {
            test("Then the bill is added and I am redirected to the bills page", () => {
                const onNavigate = (pathname) => {
                    document.body.innerHTML = ROUTES({ pathname })
                };
                const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: {} });
                // Simuler les informations du formulaire
                const typeInput = screen.getByTestId('expense-type');
                const nameInput = screen.getByTestId('expense-name');
                const amountInput = screen.getByTestId('amount');
                const dateInput = screen.getByTestId('datepicker');
                const vatInput = screen.getByTestId('vat');
                const pctInput = screen.getByTestId('pct');
                const commentaryInput = screen.getByTestId('commentary');
                const file = screen.getByTestId("file");

                fireEvent.change(typeInput, { target: { value: 'IT et électronique' } });
                fireEvent.change(nameInput, { target: { value: 'Vol Paris Tokyo' } });
                fireEvent.change(amountInput, { target: { value: '348' } });
                fireEvent.change(dateInput, { target: { value: '2023-11-20' } });
                fireEvent.change(vatInput, { target: { value: '70' } });
                fireEvent.change(pctInput, { target: { value: '20' } });
                fireEvent.change(commentaryInput, { target: { value: '' } });
                fireEvent.change(file, { target: { files: [ new File(["test"], "test.jpg", { type: "image/jpg" }) ] } });

                const newBillForm = screen.getByTestId("form-new-bill");
                const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
                newBillForm.addEventListener("submit", handleSubmit);
                fireEvent.submit(newBillForm);
                expect(handleSubmit).toHaveBeenCalled();
            });
        })
  });
});
