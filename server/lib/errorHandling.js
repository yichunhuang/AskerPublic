module.exports= {
    errorHandling: (error) => {
        if (error instanceof TypeError) {
            return new Error('Type Error');
        }
        else if (error instanceof SyntaxError) {
            return new Error('Syntax Error');
        }
        else if (error instanceof RangeError) {
            return new Error('Range Error');
        }
        else if (error instanceof ReferenceError) {
            return new Error('Reference Error');
        }
        else if (error.Error === 'ER_BAD_FIELD_ERROR' || error.Error === 'ER_PARSE_ERROR') {
            return new Error('Database Request Error');
        }
        else {
            return new Error('Server Error');
        }
    }
};