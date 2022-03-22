import {TodoListPage} from '../support/todo-list.po';
const page = new TodoListPage();

describe('Todo list', () => {

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    page.getTodoTitle().should('have.text', 'Todos');
  });
  it('Should type something in the category filter and check that it returned correct elements', () => {
    // Filter for todo 'homework'
    cy.get('#todo-category-input').type('homework');
    page.getTodoListItems().each($todo => {
        cy.wrap($todo).find('.todo-list-category').should('have.text', ' homework '); // this seems fragile since the spaces are expected
      });
  });
  it('Should type something partial in the category filter and check that it returned correct elements', () => {
    // Filter for companies that contain 'ti'
    cy.get('#todo-category-input').type('de');

    // Go through each of the cards that are being shown and get the companies
    page.getTodoListItems().find('.todo-list-category')
      // We should see these companies
      .should('contain.text', 'software design')
      .should('contain.text', 'video games')
      // We shouldn't see these companies
      .should('not.contain.text', 'groceries')
      .should('not.contain.text', 'homework');
  });
/*
  it('Should select a status, and check it return the correct elements', () =>{
      page.selectStatus('complete');
      page.getTodoListItems().each($todo => {
          cy.wrap($todo).find('.todo-list-status').should('have.text', 'true');
      });
  });
*/
  it('Should click add todo and go to the right URL', () => {
    // Click on the button for adding a new todo
    page.addTodoButton().click();

    // The URL should end with '/todos/new'
    cy.url().should(url => expect(url.endsWith('/todos/new')).to.be.true);

    // On the page we were sent to, We should see the right title
    cy.get('.add-todo-title').should('have.text', 'New Todo');
  });
});

