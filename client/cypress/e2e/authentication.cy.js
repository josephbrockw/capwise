const logIn = () => {
  const { username, password } = Cypress.env("credentials");

  cy.intercept("POST", "login").as("login");

  cy.visit("/log-in");
  cy.get('input[name="username"]').type(username);
  cy.get('input[name="password"]').type(password, { log: false });
  cy.get("button").contains("Sign In").click();
  cy.wait("@login");
};

describe("Authentication", () => {
  it("Can sign up", () => {
    cy.intercept("POST", "sign-up").as("signUp");

    cy.visit("/sign-up");
    cy.get('input[name="username"]').type("nanny");
    cy.get('input[name="email"]').type("gogg@lancre.gov");
    cy.get('input[name="firstName"]').type("Gytha");
    cy.get('input[name="lastName"]').type("Ogg");
    cy.get('input[name="password"]').type("testpass123", { log: false });
    cy.get('input[name="confirmPassword"]').type("testpass123", { log: false });
    cy.get("button").contains("Submit").click();
    cy.wait("@signUp");
    cy.url().should("contain", "/log-in");
  });

  it("Can log in", () => {
    const { username, password } = Cypress.env("credentials");

    logIn();
    cy.url().should("contain", "/dashboard");
    cy.get("button").contains("Log Out");
  });

  it("Shows error message on failed log in", () => {
    const { username, password } = Cypress.env("credentials");
    cy.intercept("POST", "login", {
      statusCode: 400,
      body: {
        __all__: [
          "Please enter a correct username and password. " +
            "Note that both fields may be case-sensitive.",
        ],
      },
    }).as("logIn");
    cy.visit("/log-in");
    cy.get('input[name="username"]').type(username);
    cy.get('input[name="password"]').type("wrongpassword", { log: false });
    cy.get("button").contains("Sign In").click();
    cy.wait("@logIn");
    cy.get("div.alert").contains(
      "Please enter a correct username and password. " +
        "Note that both fields may be case-sensitive.",
    );
    cy.url().should("contain", "/log-in");
  });

  it("Cannot visit sign-up or log-in if authenticated", () => {
    logIn();

    cy.url().should("contain", "/dashboard");
    cy.get("button").contains("Log Out");
    // Authenticated user should be redirected to dashboard if they
    // try to visit log-in page
    cy.visit("/log-in");
    cy.url().should("contain", "/dashboard");

    // Authenticated users should be redirected to dashboard if they
    // try to visit sign-up page
    cy.visit("/sign-up");
    cy.url().should("contain", "/dashboard");
  });

  it("Show invalid fields on sign up error.", function () {
    cy.intercept("POST", "sign-up", {
      statusCode: 400,
      body: {
        email: ["A user with that username already exists."],
      },
    }).as("signUp");
    cy.visit("/sign-up");
    cy.get('input[name="username"]').type("nanny");
    cy.get('input[name="email"]').type("gogg@lancre.gov");
    cy.get('input[name="firstName"]').type("Gytha");
    cy.get('input[name="lastName"]').type("Ogg");
    cy.get('input[name="password"]').type("testpass123", { log: false });
    cy.get('input[name="confirmPassword"]').type("testpass123", { log: false });
    cy.get("button").contains("Submit").click();
    cy.wait("@signUp");
    cy.get('[data-cy="invalid-feedback"]').contains(
      "A user with that username already exists.",
    );
    cy.url().should("contain", "/sign-up");
  });

  it("Can log out.", function () {
    logIn();
    cy.wait(1000);
    cy.get("[data-cy=logOut]").should("exist").should("be.visible");
    cy.get('[data-cy="logOut"]')
      .click()
      .should(() => {
        expect(window.localStorage.getItem("auth")).to.be.null;
      });
    cy.get('[data-cy="logOut"]').should("not.exist");
  });
});
