import React from 'react';
import Table from '../../../src/components/ui/Table/Table';

describe('Table Component', () => {
  const mockHeaders = ['Name', 'Age', 'Location'];

  const mockData = [
    { id: 1, Name: 'John Doe', Age: 30, Location: 'New York' },
    { id: 2, Name: 'Jane Smith', Age: 25, Location: 'San Francisco' },
    { id: 3, Name: 'Bob Johnson', Age: 40, Location: 'Chicago' }
  ];

  const mockHeadersWithFields = [
    { label: 'Full Name', field: 'Name' },
    { label: 'Years', field: 'Age' },
    { label: 'City', field: 'Location' }
  ];

  it('renders with basic headers and data', () => {
    cy.mount(
      <Table
        headers={mockHeaders}
        data={mockData}
      />
    );

    // Check that the table container exists
    cy.get('.bb-table-container').should('exist');

    // Check that the table has the base class
    cy.get('.bb-table').should('exist');

    // Check that all headers are rendered
    mockHeaders.forEach(header => {
      cy.get('thead th').contains(header).should('exist');
    });

    // Check that all data rows are rendered
    cy.get('tbody tr').should('have.length', mockData.length);

    // Check that cell data is rendered correctly
    mockData.forEach(row => {
      cy.contains('td', row.Name).should('exist');
      cy.contains('td', row.Age).should('exist');
      cy.contains('td', row.Location).should('exist');
    });
  });

  it('renders with object-based headers with field mappings', () => {
    cy.mount(
      <Table
        headers={mockHeadersWithFields}
        data={mockData}
      />
    );

    // Check that header labels are rendered correctly
    mockHeadersWithFields.forEach(header => {
      cy.get('thead th').contains(header.label).should('exist');
    });

    // Check that data is mapped correctly using the field property
    mockData.forEach(row => {
      cy.contains('td', row.Name).should('exist');
      cy.contains('td', row.Age).should('exist');
      cy.contains('td', row.Location).should('exist');
    });
  });

  it('applies striped styling when striped prop is true', () => {
    cy.mount(
      <Table
        headers={mockHeaders}
        data={mockData}
        striped={true}
      />
    );

    cy.get('.bb-table').should('have.class', 'bb-table-striped');
  });

  it('applies bordered styling when bordered prop is true', () => {
    cy.mount(
      <Table
        headers={mockHeaders}
        data={mockData}
        bordered={true}
      />
    );

    cy.get('.bb-table').should('have.class', 'bb-table-bordered');
  });

  it('applies hover styling when hover prop is true', () => {
    cy.mount(
      <Table
        headers={mockHeaders}
        data={mockData}
        hover={true}
      />
    );

    cy.get('.bb-table').should('have.class', 'bb-table-hover');
  });

  it('applies compact styling when compact prop is true', () => {
    cy.mount(
      <Table
        headers={mockHeaders}
        data={mockData}
        compact={true}
      />
    );

    cy.get('.bb-table').should('have.class', 'bb-table-compact');
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-table-class';
    cy.mount(
      <Table
        headers={mockHeaders}
        data={mockData}
        className={customClass}
      />
    );

    cy.get('.bb-table').should('have.class', customClass);
  });

  it('calls onRowClick when a row is clicked', () => {
    const onRowClick = cy.stub().as('onRowClick');

    cy.mount(
      <Table
        headers={mockHeaders}
        data={mockData}
        onRowClick={onRowClick}
      />
    );

    // Check that rows have the clickable class
    cy.get('tbody tr').should('have.class', 'bb-table-clickable');

    // Click the first row and verify the callback was called with the correct data
    cy.get('tbody tr').first().click();
    cy.get('@onRowClick').should('have.been.calledWith', mockData[0]);

    // Click the second row and verify the callback was called with the correct data
    cy.get('tbody tr').eq(1).click();
    cy.get('@onRowClick').should('have.been.calledWith', mockData[1]);
  });

  it('uses custom keyField for row keys', () => {
    const customKeyField = 'Name';
    const onRowClick = cy.stub().as('onRowClick');

    cy.mount(
      <Table
        headers={mockHeaders}
        data={mockData}
        keyField={customKeyField}
        onRowClick={onRowClick}
      />
    );

    // Click a row and verify the callback is called
    cy.get('tbody tr').eq(1).click();
    cy.get('@onRowClick').should('have.been.calledWith', mockData[1]);
  });

  it('shows empty state message when data is empty', () => {
    cy.mount(
      <Table
        headers={mockHeaders}
        data={[]}
      />
    );

    // Check that there's only one row with the empty message
    cy.get('tbody tr').should('have.length', 1);
    cy.get('.bb-table-empty').should('contain', 'No data available');

    // Check that the colspan is set to the number of headers
    cy.get('tbody td').should('have.attr', 'colspan', mockHeaders.length.toString());
  });

  it('handles undefined values in data', () => {
    const dataWithUndefined = [
      { id: 1, Name: 'John Doe', Age: undefined, Location: 'New York' },
      { id: 2, Name: 'Jane Smith', Age: 25, Location: undefined }
    ];

    cy.mount(
      <Table
        headers={mockHeaders}
        data={dataWithUndefined}
      />
    );

    // Check that cells with undefined values are rendered as empty strings
    cy.contains('tr', 'John Doe').find('td').eq(1).should('be.empty');
    cy.contains('tr', 'Jane Smith').find('td').eq(2).should('be.empty');
  });

  it('combines multiple styling options correctly', () => {
    cy.mount(
      <Table
        headers={mockHeaders}
        data={mockData}
        striped={true}
        bordered={true}
        hover={true}
        compact={true}
        className="custom-class"
      />
    );

    const table = cy.get('.bb-table');
    table.should('have.class', 'bb-table-striped');
    table.should('have.class', 'bb-table-bordered');
    table.should('have.class', 'bb-table-hover');
    table.should('have.class', 'bb-table-compact');
    table.should('have.class', 'custom-class');
  });
});
