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

//Scenario 10: création d une nouvelle note de frais, le fichier est bien ajouté
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
      // Vérifie que le fichier est bien ajouté si le format est valide
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
  });
});
