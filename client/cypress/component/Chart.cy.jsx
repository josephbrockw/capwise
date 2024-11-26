import React from 'react';
import Chart from '../../src/components/ui/Chart/Chart';

describe('Chart', () => {
    const sampleData = {
        labels: ['January', 'February', 'March'],
        datasets: [{
            label: 'Sample Dataset',
            data: [65, 59, 80],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    };

    // Wait for chart to be fully rendered and return the chart instance
    function getChartInstance() {
        return cy.get('canvas')
            .should('be.visible')
            .then(($canvas) => {
                const canvas = $canvas[0];
                // Wait for the chart instance to be available
                return new Cypress.Promise((resolve) => {
                    const checkInstance = () => {
                        const instance = canvas.__chartInstance;
                        if (instance) {
                            resolve(instance);
                        } else {
                            setTimeout(checkInstance, 100);
                        }
                    };
                    checkInstance();
                });
            });
    }

    it('should render a bar chart with correct configuration', () => {
        cy.mount(<Chart type="bar" data={sampleData} />);

        getChartInstance().then((chart) => {
            expect(chart.config.type).to.equal('bar');
            expect(chart.data.labels).to.deep.equal(sampleData.labels);
            expect(chart.data.datasets[0].data).to.deep.equal(sampleData.datasets[0].data);
        });
    });

    it('should render a line chart with correct configuration', () => {
        cy.mount(<Chart type="line" data={sampleData} />);

        getChartInstance().then((chart) => {
            expect(chart.config.type).to.equal('line');
            expect(chart.data.labels).to.deep.equal(sampleData.labels);
            expect(chart.data.datasets[0].data).to.deep.equal(sampleData.datasets[0].data);
        });
    });

    it('should render a pie chart with correct configuration', () => {
        cy.mount(<Chart type="pie" data={sampleData} />);

        getChartInstance().then((chart) => {
            expect(chart.config.type).to.equal('pie');
            expect(chart.data.labels).to.deep.equal(sampleData.labels);
            expect(chart.data.datasets[0].data).to.deep.equal(sampleData.datasets[0].data);
        });
    });

    it('should apply custom className', () => {
        const customClass = 'custom-chart-class';
        cy.mount(<Chart type="bar" data={sampleData} className={customClass} />);
        cy.get('.bb-chart-container').should('have.class', customClass);
    });

    it('should handle empty data', () => {
        const emptyData = {
            labels: [],
            datasets: [{
                label: 'Empty Dataset',
                data: []
            }]
        };
        cy.mount(<Chart type="bar" data={emptyData} />);

        getChartInstance().then((chart) => {
            expect(chart.data.datasets[0].data).to.have.length(0);
            expect(chart.data.labels).to.have.length(0);
        });
    });

    it('should apply custom options', () => {
        const customOptions = {
            plugins: {
                title: {
                    display: true,
                    text: 'Custom Title'
                }
            }
        };
        cy.mount(<Chart
            type="bar"
            data={sampleData}
            options={customOptions}
        />);

        getChartInstance().then((chart) => {
            expect(chart.options.plugins.title.display).to.be.true;
            expect(chart.options.plugins.title.text).to.equal('Custom Title');
        });
    });

    it('should handle multiple datasets', () => {
        const multiData = {
            labels: ['January', 'February', 'March'],
            datasets: [
                {
                    label: 'Dataset 1',
                    data: [65, 59, 80],
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                },
                {
                    label: 'Dataset 2',
                    data: [28, 48, 40],
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                }
            ]
        };
        cy.mount(<Chart type="bar" data={multiData} />);

        getChartInstance().then((chart) => {
            expect(chart.data.datasets).to.have.length(2);
            expect(chart.data.datasets[0].data).to.deep.equal(multiData.datasets[0].data);
            expect(chart.data.datasets[1].data).to.deep.equal(multiData.datasets[1].data);
        });
    });

    it('should handle data updates', () => {
        const updatedData = {
            labels: ['January', 'February', 'March'],
            datasets: [{
                label: 'Updated Dataset',
                data: [30, 40, 50],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
            }]
        };

        cy.mount(<Chart type="bar" data={sampleData} />);

        getChartInstance().then((chart) => {
            expect(chart.data.datasets[0].data).to.deep.equal(sampleData.datasets[0].data);
        });

        cy.mount(<Chart type="bar" data={updatedData} />);

        getChartInstance().then((chart) => {
            expect(chart.data.datasets[0].data).to.deep.equal(updatedData.datasets[0].data);
        });
    });
});
