import React from 'react';
import { Toast, ToastProvider, ToastContainer, useToast, POSITIONS, TYPES } from '../../src/components/ui/Toast';

// Test component that uses the useToast hook
const ToastDemo = () => {
  const { addToast, success, error, normal } = useToast();

  return (
    <div>
      <button data-cy="add-normal" onClick={() => normal('Normal toast')}>Add Normal</button>
      <button data-cy="add-success" onClick={() => success('Success toast')}>Add Success</button>
      <button data-cy="add-error" onClick={() => error('Error toast')}>Add Error</button>
      <button
        data-cy="add-custom"
        onClick={() => addToast({
          message: 'Custom toast',
          type: TYPES.NORMAL,
          position: POSITIONS.TOP_RIGHT,
          duration: 5000
        })}
      >
        Add Custom
      </button>
      <button
        data-cy="add-multiple"
        onClick={() => {
          normal('First toast');
          success('Second toast');
          error('Third toast');
        }}
      >
        Add Multiple
      </button>
      <button
        data-cy="add-with-data-cy"
        onClick={() => normal('Toast with data-cy', { 'data-cy': 'custom-toast-cy' })}
      >
        Add With Data-Cy
      </button>
      <button
        data-cy="add-permanent"
        onClick={() => addToast({
          message: 'Permanent toast',
          type: TYPES.NORMAL,
          duration: 0
        })}
      >
        Add Permanent
      </button>
      <button
        data-cy="add-positioned"
        onClick={() => {
          addToast({ message: 'Top Left', position: POSITIONS.TOP_LEFT });
          addToast({ message: 'Top Right', position: POSITIONS.TOP_RIGHT });
          addToast({ message: 'Bottom Left', position: POSITIONS.BOTTOM_LEFT });
          addToast({ message: 'Bottom Right', position: POSITIONS.BOTTOM_RIGHT });
        }}
      >
        Add All Positions
      </button>
    </div>
  );
};

describe('Toast System', () => {
  describe('Individual Toast Component', () => {
    let defaultProps;

    beforeEach(() => {
      defaultProps = {
        message: 'Test message',
        type: 'normal',
        onClose: cy.stub().as('onClose'),
      };
      cy.clock();
    });

    it('renders with default props', () => {
      cy.mount(<Toast {...defaultProps} />);
      cy.get('.toast').should('exist');
      cy.get('.toast-message').should('contain', defaultProps.message);
      cy.get('.toast').should('have.class', 'toast-normal');
    });

    it('renders different types correctly', () => {
      cy.mount(<Toast {...defaultProps} type="success" />);
      cy.get('.toast').should('have.class', 'toast-success');

      cy.mount(<Toast {...defaultProps} type="error" />);
      cy.get('.toast').should('have.class', 'toast-error');
    });

    it('auto-closes after duration', () => {
      // Use a spy that we can check was called
      const onCloseSpy = cy.spy().as('onClose');

      cy.mount(
        <Toast
          message="Test message"
          type="normal"
          duration={1000}
          onClose={onCloseSpy}
        />
      );

      // Need to wait for the duration plus the animation delay (300ms)
      cy.tick(1000 + 300);

      cy.get('@onClose').should('have.been.called');
    });

    it('closes on button click', () => {
      cy.mount(<Toast {...defaultProps} />);
      cy.get('.toast-close').click();

      // Need to wait for the animation delay
      cy.tick(300);

      cy.get('@onClose').should('have.been.called');
    });

    it('disables close button after clicking', () => {
      cy.mount(<Toast {...defaultProps} />);
      cy.get('.toast-close').click();
      cy.get('.toast-close').should('be.disabled');

      // Need to wait for the animation delay
      cy.tick(300);

      cy.get('@onClose').should('have.been.calledOnce');
    });

    it('passes through data-cy attributes', () => {
      cy.mount(<Toast {...defaultProps} data-cy="success-message" />);
      cy.get('[data-cy="success-message"]').should('exist');
      cy.get('[data-cy="success-message-close"]').should('exist');
    });

    it('does not auto-close with duration of 0', () => {
      const onCloseSpy = cy.spy().as('onClose');

      cy.mount(
        <Toast
          message="Test message"
          type="normal"
          duration={0}
          onClose={onCloseSpy}
        />
      );

      cy.tick(5000);
      cy.get('@onClose').should('not.have.been.called');
    });

    it('adds closing animation class when closing', () => {
      cy.mount(<Toast {...defaultProps} />);
      cy.get('.toast-close').click();
      cy.get('.toast').should('have.class', 'toast-closing');
    });
  });

  describe('ToastProvider Component', () => {
    // Create a test component that uses the context directly
    const ToastContextTester = () => {
      const toastContext = useToast();

      return (
        <div>
          <div data-cy="context-value">{JSON.stringify(toastContext.toasts)}</div>
          <button
            data-cy="add-toast"
            onClick={() => toastContext.addToast({ message: 'Test toast' })}
          >
            Add Toast
          </button>
          <button
            data-cy="remove-toast"
            onClick={() => {
              if (toastContext.toasts.length > 0) {
                toastContext.removeToast(toastContext.toasts[0].id);
              }
            }}
          >
            Remove Toast
          </button>
          <button
            data-cy="add-success"
            onClick={() => toastContext.success('Success toast')}
          >
            Add Success
          </button>
          <button
            data-cy="add-error"
            onClick={() => toastContext.error('Error toast')}
          >
            Add Error
          </button>
          <button
            data-cy="add-normal"
            onClick={() => toastContext.normal('Normal toast')}
          >
            Add Normal
          </button>
        </div>
      );
    };

    it('initializes with empty toasts array', () => {
      cy.mount(
        <ToastProvider>
          <ToastContextTester />
        </ToastProvider>
      );

      cy.get('[data-cy="context-value"]').should('contain', '[]');
    });

    it('adds toast with addToast method', () => {
      cy.mount(
        <ToastProvider>
          <ToastContextTester />
        </ToastProvider>
      );

      cy.get('[data-cy="add-toast"]').click();
      cy.get('[data-cy="context-value"]').should('not.contain', '[]');
      cy.get('[data-cy="context-value"]').should('contain', 'Test toast');
    });

    it('removes toast with removeToast method', () => {
      cy.mount(
        <ToastProvider>
          <ToastContextTester />
        </ToastProvider>
      );

      cy.get('[data-cy="add-toast"]').click();
      cy.get('[data-cy="context-value"]').should('not.contain', '[]');

      cy.get('[data-cy="remove-toast"]').click();
      cy.get('[data-cy="context-value"]').should('contain', '[]');
    });

    it('provides convenience methods for different toast types', () => {
      cy.mount(
        <ToastProvider>
          <ToastContextTester />
        </ToastProvider>
      );

      // Add success toast
      cy.get('[data-cy="add-success"]').click();
      cy.get('[data-cy="context-value"]').should('contain', 'Success toast');
      cy.get('[data-cy="context-value"]').should('contain', '"type":"success"');

      // Add error toast
      cy.get('[data-cy="add-error"]').click();
      cy.get('[data-cy="context-value"]').should('contain', 'Error toast');
      cy.get('[data-cy="context-value"]').should('contain', '"type":"error"');

      // Add normal toast
      cy.get('[data-cy="add-normal"]').click();
      cy.get('[data-cy="context-value"]').should('contain', 'Normal toast');
      cy.get('[data-cy="context-value"]').should('contain', '"type":"normal"');
    });

    it('supports different toast positions', () => {
      cy.clock(); // Use clock to control timing

      // Create a component that adds toasts in different positions
      const PositionedToastTester = () => {
        const { addToast, toasts } = useToast();

        return (
          <div>
            <div data-cy="toast-count">{toasts.length} toasts</div>
            <button
              data-cy="add-all-positions"
              onClick={() => {
                // Add toasts in all four positions with explicit position values
                addToast({
                  message: 'Top Left Toast',
                  position: 'top-left',
                  duration: 0 // Make them permanent for testing
                });
                addToast({
                  message: 'Top Right Toast',
                  position: 'top-right',
                  duration: 0
                });
                addToast({
                  message: 'Bottom Left Toast',
                  position: 'bottom-left',
                  duration: 0
                });
                addToast({
                  message: 'Bottom Right Toast',
                  position: 'bottom-right',
                  duration: 0
                });
              }}
            >
              Add All Positions
            </button>
          </div>
        );
      };

      cy.mount(
        <ToastProvider>
          <PositionedToastTester />
          <ToastContainer />
        </ToastProvider>
      );

      // Initially no toasts
      cy.get('[data-cy="toast-count"]').should('contain', '0 toasts');

      // Add toasts in all positions with a single click
      cy.get('[data-cy="add-all-positions"]').click();

      // Should now have 4 toasts
      cy.get('[data-cy="toast-count"]').should('contain', '4 toasts');

      // Check if we have toast containers
      cy.get('.toast-container').should('have.length', 4);

      // Check for specific toast messages in each position
      cy.contains('.toast-message', 'Top Left Toast').should('exist');
      cy.contains('.toast-message', 'Top Right Toast').should('exist');
      cy.contains('.toast-message', 'Bottom Left Toast').should('exist');
      cy.contains('.toast-message', 'Bottom Right Toast').should('exist');
    });
  });

  describe('Toast System Integration', () => {
    beforeEach(() => {
      cy.clock();
    });

    it('renders ToastContainer with no toasts initially', () => {
      cy.mount(
        <ToastProvider>
          <ToastContainer />
        </ToastProvider>
      );
      cy.get('[data-cy="toast-container"]').should('not.exist');
    });

    it('adds and displays a toast', () => {
      cy.mount(
        <ToastProvider>
          <ToastDemo />
          <ToastContainer />
        </ToastProvider>
      );

      cy.get('[data-cy="add-normal"]').click();
      cy.get('.toast').should('exist');
      cy.get('.toast-message').should('contain', 'Normal toast');
    });

    it('supports different toast types', () => {
      cy.mount(
        <ToastProvider>
          <ToastDemo />
          <ToastContainer />
        </ToastProvider>
      );

      cy.get('[data-cy="add-success"]').click();
      cy.get('.toast-success').should('exist');

      cy.get('[data-cy="add-error"]').click();
      cy.get('.toast-error').should('exist');
    });

    it('supports custom toast positions', () => {
      cy.mount(
        <ToastProvider>
          <ToastDemo />
          <ToastContainer />
        </ToastProvider>
      );

      cy.get('[data-cy="add-custom"]').click();
      cy.get('.toast-top-right').should('exist');
    });

    it('supports multiple toasts at once', () => {
      cy.mount(
        <ToastProvider>
          <ToastDemo />
          <ToastContainer />
        </ToastProvider>
      );

      cy.get('[data-cy="add-multiple"]').click();
      cy.get('.toast').should('have.length', 3);
    });

    it('auto-removes toasts after duration', () => {
      cy.mount(
        <ToastProvider>
          <ToastDemo />
          <ToastContainer />
        </ToastProvider>
      );

      cy.get('[data-cy="add-normal"]').click();
      cy.get('.toast').should('exist');

      // Need to wait for the duration (3000ms) plus the animation delay (300ms)
      cy.tick(3000 + 300);
      cy.get('.toast').should('not.exist');
    });

    it('supports custom data-cy attributes', () => {
      cy.mount(
        <ToastProvider>
          <ToastDemo />
          <ToastContainer />
        </ToastProvider>
      );

      // Click the button that adds a toast with a custom data-cy attribute
      cy.get('[data-cy="add-with-data-cy"]').click();

      // Wait for the toast to appear and verify it has the custom data-cy attribute
      // and contains the expected message
      cy.get('[data-cy="custom-toast-cy"]').should('exist');
      cy.get('[data-cy="custom-toast-cy"] .toast-message').should('contain', 'Toast with data-cy');
    });

    it('keeps permanent toasts visible', () => {
      cy.mount(
        <ToastProvider>
          <ToastDemo />
          <ToastContainer />
        </ToastProvider>
      );

      cy.get('[data-cy="add-permanent"]').click();
      cy.get('.toast').should('exist');

      // Even after a long time, the toast should still be visible
      cy.tick(10000);
      cy.get('.toast').should('exist');
      cy.get('.toast-message').should('contain', 'Permanent toast');
    });

    it('groups toasts by position', () => {
      cy.mount(
        <ToastProvider>
          <ToastDemo />
          <ToastContainer />
        </ToastProvider>
      );

      // Add toasts in all four positions
      cy.get('[data-cy="add-positioned"]').click();

      // Check that each position container exists
      cy.get('.toast-container.toast-top-left').should('exist');
      cy.get('.toast-container.toast-top-right').should('exist');
      cy.get('.toast-container.toast-bottom-left').should('exist');
      cy.get('.toast-container.toast-bottom-right').should('exist');

      // Check that each container has the correct toast
      cy.get('.toast-container.toast-top-left .toast-message').should('contain', 'Top Left');
      cy.get('.toast-container.toast-top-right .toast-message').should('contain', 'Top Right');
      cy.get('.toast-container.toast-bottom-left .toast-message').should('contain', 'Bottom Left');
      cy.get('.toast-container.toast-bottom-right .toast-message').should('contain', 'Bottom Right');
    });

    it('removes toasts individually', () => {
      cy.mount(
        <ToastProvider>
          <ToastDemo />
          <ToastContainer />
        </ToastProvider>
      );

      cy.get('[data-cy="add-multiple"]').click();
      cy.get('.toast').should('have.length', 3);

      // Close the first toast
      cy.get('.toast-close').first().click();

      // Wait for the animation delay (300ms) to complete
      cy.tick(300);

      // Should now have 2 toasts
      cy.get('.toast').should('have.length', 2);
    });

    it('handles convenience methods correctly', () => {
      cy.mount(
        <ToastProvider>
          <ToastDemo />
          <ToastContainer />
        </ToastProvider>
      );

      // Test success method
      cy.get('[data-cy="add-success"]').click();
      cy.get('.toast-success').should('exist');
      cy.get('.toast-message').should('contain', 'Success toast');

      // Test error method
      cy.get('[data-cy="add-error"]').click();
      cy.get('.toast-error').should('exist');
      cy.get('.toast-message').should('contain', 'Error toast');

      // Test normal method
      cy.get('[data-cy="add-normal"]').click();
      cy.get('.toast-normal').should('exist');
      cy.get('.toast-message').should('contain', 'Normal toast');
    });

    it('automatically removes toasts after duration', () => {
      cy.clock();

      // Create a component that adds a toast with a specific duration
      const TimedToastTester = () => {
        const { addToast } = useToast();

        return (
          <div>
            <button
              data-cy="add-timed-toast"
              onClick={() => addToast({
                message: 'Timed Toast',
                duration: 2000
              })}
            >
              Add Timed Toast
            </button>
            <div data-cy="toast-count">
              {useToast().toasts.length} toasts
            </div>
          </div>
        );
      };

      cy.mount(
        <ToastProvider>
          <TimedToastTester />
          <ToastContainer />
        </ToastProvider>
      );

      // Initially no toasts
      cy.get('[data-cy="toast-count"]').should('contain', '0 toasts');

      // Add a toast with 2000ms duration
      cy.get('[data-cy="add-timed-toast"]').click();

      // Should now have 1 toast
      cy.get('[data-cy="toast-count"]').should('contain', '1 toasts');
      cy.get('.toast').should('exist');

      // Advance time by 2000ms
      cy.tick(2000);

      // Toast should be removed automatically
      cy.get('[data-cy="toast-count"]').should('contain', '0 toasts');
      cy.get('.toast').should('not.exist');
    });
  });
});
