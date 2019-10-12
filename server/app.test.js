const subject = require('./model/subject.js');
const errorHandling = require("./lib/errorHandling.js").errorHandling;

test('get all subjects', async () => {
    const expected = [ 
        { id: 1, name: 'Math' },
        { id: 2, name: 'English' },
        { id: 3, name: 'Science' },
        { id: 4, name: 'Geography' },
        { id: 5, name: 'Chinese' },
        { id: 6, name: 'Japanese' },
        { id: 7, name: 'Computer' },
        { id: 8, name: 'Economics' } 
    ]
    expect(await subject.readAll()).toBeDefined();
    expect(await subject.readAll()).toEqual(expect.arrayContaining(expected));
}); 

test('get corresponding error', async () => {
    expect(errorHandling(new TypeError('type error testing')).message).toEqual(expect.stringContaining('Type Error'));
    expect(errorHandling(new SyntaxError('syntax error testing')).message).toEqual(expect.stringContaining('Syntax Error'));
    expect(errorHandling(new RangeError('range error testing')).message).toEqual(expect.stringContaining('Range Error'));
    expect(errorHandling(new ReferenceError('reference error testing')).message).toEqual(expect.stringContaining('Reference Error'));
    expect(errorHandling({Error: 'ER_BAD_FIELD_ERROR'}).message).toEqual(expect.stringContaining('Database Request Error'));
    expect(errorHandling({Error: 'ER_PARSE_ERROR'}).message).toEqual(expect.stringContaining('Database Request Error'));
    expect(errorHandling({Error: 'else'}).message).toEqual(expect.stringContaining('Server Error'));
});

const axios = require('axios');
const getFacebookProfile = require('./lib/facebook.js');
jest.mock('axios');
test('get facebook profile', () => {
    const user = { 
        id: '26204',
        name: 'Jenny Huang',
        email: 'b03704074@ntu.edu.tw' 
    }
    const resp = {data: user};
    axios.get.mockResolvedValue(resp);
    return getFacebookProfile().then(result => expect(result).toEqual(user))

})

