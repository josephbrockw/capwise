import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Chart as ChartJS } from 'chart.js/auto';
import './Chart.css';

const Chart = ({ type, data, options = {}, className = '', ...props }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Create new chart
      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new ChartJS(ctx, {
        type,
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false, // Disable animations for testing
          ...options,
        },
      });

      // Store the chart instance on the canvas element for testing
      chartRef.current.__chartInstance = chartInstance.current;
    }

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, data, options]);

  return (
    <div className={`bb-chart-container ${className}`} {...props}>
      <canvas ref={chartRef} />
    </div>
  );
};

Chart.propTypes = {
  type: PropTypes.oneOf(['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'bubble', 'scatter']).isRequired,
  data: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string),
    datasets: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  options: PropTypes.object,
  className: PropTypes.string,
};

export default Chart;
