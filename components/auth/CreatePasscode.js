
import React, { useState, useEffect } from 'react';
import PasscodeInput from './PasscodeInput';

const CreatePasscode = ({ onPasscodeCreated }) => {
  const [passcode, setPasscode] = useState('');

  useEffect(() => {
    if (passcode.length === 6) {
      // Automatically proceed to the next step
      setTimeout(() => onPasscodeCreated(passcode), 300); // Small delay for user to see the last digit
    }
  }, [passcode, onPasscodeCreated]);

  return (
    <PasscodeInput 
        title="Create Passcode"
        subtitle="Secure your wallet with a 6-digit passcode."
        passcode={passcode}
        onPasscodeChange={setPasscode}
    />
  );
};

export default CreatePasscode;
