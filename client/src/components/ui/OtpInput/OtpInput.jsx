import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './OtpInput.css';

const OtpInput = ({ length = 6, value = '', onChange, mask = false }) => {
  const [otp, setOtp] = useState(value.split(''));
  const inputRefs = useRef([]);

  useEffect(() => {
    // Update internal state if value prop changes
    setOtp(value.split('').concat(Array(length - value.length).fill('')));
  }, [value, length]);

  const clearInput = (index) => {
    const newOtp = [...otp];
    newOtp[index] = '';
    setOtp(newOtp);
    onChange({ value: newOtp.join('') });
  };

  const handleChange = (e, index) => {
    const newValue = e.target.value;

    // Handle backspace/delete
    if (newValue === '') {
      clearInput(index);
      if (index > 0) {
        inputRefs.current[index - 1].focus();
      }
      return;
    }

    // Handle regular input
    if (newValue.length > 1) return; // Prevent pasting multiple characters

    const newOtp = [...otp];
    newOtp[index] = newValue;
    setOtp(newOtp);

    // Call onChange with the complete string
    onChange({ value: newOtp.join('') });

    // Move to next input if we entered a digit
    if (newValue && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      e.preventDefault(); // Prevent the default backspace behavior

      // If current input is empty and not first input, move to previous and clear it
      if (!otp[index] && index > 0) {
        clearInput(index - 1);  // Clear the previous input
        inputRefs.current[index - 1].focus();
      } else {
        // Clear current input and move to previous if not first
        clearInput(index);
        if (index > 0) {
          inputRefs.current[index - 1].focus();
        }
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, length);
    const newOtp = pastedData.split('').concat(Array(length - pastedData.length).fill(''));
    setOtp(newOtp);
    onChange({ value: newOtp.join('') });

    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex(x => !x);
    const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="otp-input-container">
      {Array(length).fill(null).map((_, index) => (
        <input
          key={index}
          ref={el => inputRefs.current[index] = el}
          type={mask ? 'password' : 'text'}
          maxLength={1}
          value={otp[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="otp-input"
          pattern="[0-9]*"
          inputMode="numeric"
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
};

OtpInput.propTypes = {
  length: PropTypes.number,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  mask: PropTypes.bool,
};

export default OtpInput;
