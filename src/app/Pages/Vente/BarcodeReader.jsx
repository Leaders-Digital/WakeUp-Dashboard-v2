import React, { useRef, useState } from 'react';

// Map special characters to their "Shifted" equivalents
const shiftKeyMap = {
    '&': '1',
    'é': '2',
    '"': '3',
    "'": '4',
    '(': '5',
    '-': '6',
    'è': '7',
    '_': '8',
    'ç': '9',
    'à': '0',

};
const BarcodeScannerInput = () => {
    const inputRef = useRef(null);
    const [inputValue, setInputValue] = useState('');

    // Handle barcode scanner input
    const handleInput = (event) => {
        let value = event.target.value;

        // Transform input to simulate Shift key behavior
        value = value
            .split('')
            .map((char) => shiftKeyMap[char] || char) // Replace special characters using the map
            .join('');

        setInputValue(value);
    };

    // Focus the input on component mount
    React.useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <div>
            <input
                ref={inputRef}
                value={inputValue}
                onChange={handleInput}
                placeholder="Scan barcode here"
                style={{ width: '300px', padding: '10px', fontSize: '16px' }}
            />
            <p>Processed Input: {inputValue}</p>
        </div>
    );
};

export default BarcodeScannerInput;
