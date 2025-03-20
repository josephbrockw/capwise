import React from 'react';
import PropTypes from 'prop-types';
import './SelectableCards.css';

/**
 * SelectableCards component for creating a grid of selectable card items
 *
 * @param {Object} props Component props
 * @param {Array} props.items Array of items to display as cards
 * @param {Function} props.renderItem Function to render the content of each card
 * @param {Array} props.selectedIds Array of selected item IDs
 * @param {Function} props.onSelectionChange Callback when selection changes
 * @param {string} props.idField Field name to use as unique identifier (default: 'id')
 * @param {number} props.maxSelections Maximum number of items that can be selected
 * @param {string} props.title Optional title for the selection group
 * @param {string} props.selectionCountText Optional text to display selection count (e.g., "Selected: {count}/{max}")
 * @param {string} props.className Additional CSS class for the container
 * @param {boolean} props.compact Optional flag to make cards compact
 */
const SelectableCards = ({
  items = [],
  renderItem,
  selectedIds = [],
  onSelectionChange,
  idField = 'id',
  maxSelections = null,
  title = null,
  selectionCountText = 'Selected: {count}{maxText}',
  className = '',
  compact = false
}) => {
  // Handle card selection
  const handleCardClick = (item) => {
    const itemId = item[idField];
    const isSelected = selectedIds.includes(itemId);

    // Don't allow selecting more than maxSelections
    if (maxSelections !== null && selectedIds.length >= maxSelections && !isSelected) {
      return;
    }

    if (isSelected) {
      // Remove the item if already selected
      onSelectionChange(selectedIds.filter(id => id !== itemId));
    } else {
      // Add the item if not already selected
      onSelectionChange([...selectedIds, itemId]);
    }
  };

  // Format the selection count text
  const formattedSelectionCountText = selectionCountText
    .replace('{count}', selectedIds.length)
    .replace('{maxText}', maxSelections !== null ? `/${maxSelections}` : '');

  return (
    <div className={`bb-selectable-cards ${className}`}>
      {title && <h3 className="bb-selectable-cards-title">{title}</h3>}
      {maxSelections !== null && (
        <p className="bb-selectable-cards-count">{formattedSelectionCountText}</p>
      )}
      <div className={`bb-selectable-cards-flex ${compact ? 'bb-selectable-cards-flex-compact' : ''}`}>
        {items.map((item) => {
          const itemId = item[idField];
          const isSelected = selectedIds.includes(itemId);
          const maxSelectionsReached = maxSelections !== null &&
                                      selectedIds.length >= maxSelections &&
                                      !isSelected;

          return (
            <div
              key={itemId}
              className={`bb-selectable-card
                ${compact ? 'selectable-card-compact' : ''}
                ${isSelected ? 'bb-selectable-card-selected' : ''}
                ${maxSelectionsReached ? 'bb-selectable-card-disabled' : ''}`}
              onClick={() => handleCardClick(item)}
            >
              {renderItem(item, { isSelected })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

SelectableCards.propTypes = {
  items: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
  selectedIds: PropTypes.array.isRequired,
  onSelectionChange: PropTypes.func.isRequired,
  idField: PropTypes.string,
  maxSelections: PropTypes.number,
  title: PropTypes.string,
  selectionCountText: PropTypes.string,
  className: PropTypes.string,
  compact: PropTypes.bool
};

export default SelectableCards;
