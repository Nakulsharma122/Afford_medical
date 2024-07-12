const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

const WINDOW_SIZE = 10;
const TEST_SERVER_URL = "http://20.244.56.144/test/primes";
const REQUEST_TIMEOUT = 500; // 500 ms timeout

let window = [];

const isValidId = (numberid) => {
    return ['p', 'f', 'e', 'r'].includes(numberid);
};

const fetchNumbers = async (numberid) => {
    try {
        const response = await axios.get(`${TEST_SERVER_URL}${numberid}`, { timeout: REQUEST_TIMEOUT });
        return response.data; // Assuming the response is a JSON list of numbers
    } catch (error) {
        return [];
    }
};

const updateWindow = (newNumbers) => {
    const uniqueNumbers = Array.from(new Set(newNumbers));
    uniqueNumbers.forEach(number => {
        if (!window.includes(number)) {
            window.push(number);
            if (window.length > WINDOW_SIZE) {
                window.shift();
            }
        }
    });
};

const calculateAverage = () => {
    if (window.length === 0) return 0;
    const sum = window.reduce((acc, num) => acc + num, 0);
    return sum / window.length;
};

app.get('/numbers/:numberid', async (req, res) => {
    const numberid = req.params.numberid;

    if (!isValidId(numberid)) {
        return res.status(400).json({ error: 'Invalid number ID' });
    }

    const startTime = Date.now();
    const newNumbers = await fetchNumbers(numberid);
    const fetchDuration = Date.now() - startTime;

    if (fetchDuration >= REQUEST_TIMEOUT) {
        return res.status(500).json({ error: 'Request timeout' });
    }

    const previousState = [...window];
    updateWindow(newNumbers);
    const currentState = [...window];
    const avg = calculateAverage();

    const response = {
        numbers: newNumbers,
        windowPrevState: previousState,
        windowCurrState: currentState,
        avg: avg.toFixed(2)
    };

    res.status(200).json(response);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});