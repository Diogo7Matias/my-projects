const fs = require('fs');
const readLine = require('readline');

const hexChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
const escapeSequences = ['"', '\\', '/', 'b', 'f', 'n', 'r', 't', 'u']
const whitespace = [' ', '\n', '\r', '\t']

// Converts a JSON file's content into a string in CSV format
// Given the nature of CSV files, this function expects the JSON to be tabular (an array of objects)
function json2csv(data){
    let csvContent = ""
    let index = {value: 0};

    while (!endofData(data, index.value)){
        switch (data[index.value++]){
            case '[':
                arr = parseArray(data, index);
                if (arr === null){
                    console.log("Error: Invalid JSON file.");
                    return null;
                }

                skipWhitespace(data, index);
                csvContent += arrayToCSV(arr);
                break;
            // case '...': maybe handle non-tabular files later
            default: // Invalid 
                console.log("Error: Invalid JSON file.");
                return null;
        }
    }
    return csvContent;
}

// returns the object parsed from data[index] or null if
// 'data' does not contain a valid JSON object 
function parseObject(data, index){
    let obj = {};

    skipWhitespace(data, index);
    if (data[index.value] === '}') return {};
    let member = parseObjectMember(data, index);
    if (member === null) return null;

    // adds member to obj
    let key = Object.keys(member)[0];
    obj[key] = member[key];

    // keeps reading more members until we reach the end
    while (data[index.value] !== '}'){
        if (data[index.value++] !== ',') return null;

        member = parseObjectMember(data, index);
        if (member === null) return null;
        
        // adds member to obj
        let key = Object.keys(member)[0];
        obj[key] = member[key];
    }
    index.value++;
    return obj;
}

// returns a string:value pair read from data[index] or null if
// the data is invalid JSON
function parseObjectMember(data, index){
    let str = '', value;
    
    skipWhitespace(data, index);
    if (data[index.value++] !== '"') return null;

    // consume characters to store in 'str'
    while (!endofData(data, index.value) && !(data[index.value] === '"' && data[index.value - 1] !== '\\'))
        str += data[index.value++];

    if (endofData(data, index.value)) return null;
    if (data[index.value++] !== '"') return null;
    skipWhitespace(data, index);
    if (!isValidString(str) || data[index.value++] !== ':') return null;

    value = parseValue(data, index);
    return value === null ? null : {[str]: value};
}

// Returns a value read from data[index] or null if there was no valid JSON value to be read.
// A JSON value can be: an Object, an Array, 
//                      a String, a Number, or the keywords 'true', 'false' and 'null'.
function parseValue(data, index){
    skipWhitespace(data, index);

    // For Objects
    if (data[index.value] === '{'){
        index.value++;
        let ret = parseObject(data, index);
        skipWhitespace(data, index);
        return ret;
    }
    // For Arrays
    if (data[index.value] === '['){
        index.value++;
        let ret = parseArray(data, index);
        skipWhitespace(data, index);
        return ret;
    }

    let i = index.value;
    let str = '';

    // For Strings
    if (data[index.value] === '"'){
        index.value++;
        // consume characters to store in 'str'
        while (!endofData(data, index.value) && !(data[index.value] === '"' && data[index.value - 1] !== '\\'))
            str += data[index.value++];
        
        if (data[index.value++] !== '"') return null;
        if (isValidString(str)){
            skipWhitespace(data, index);
            return str;
        }
    }

    // For true, false and null
    str = data.slice(index.value, index.value + 4);
    if (str === "true" ||  str === "null"){
        index.value += str.length;
        skipWhitespace(data, index);
        return str;
    }
    str = data.slice(index.value, index.value + 5);
    if (str === "false"){
        index.value += str.length;
        skipWhitespace(data, index);
        return str;
    }

    // For Numbers
    if (readNumber(data, index)){
        str = data.slice(i, index.value);
        skipWhitespace(data, index);
        return str;
    }
    return null;
}

// returns the array parsed from data[index] or null if 'data' 
// does not contain a valid JSON array
function parseArray(data, index){
    let arr = [];
    skipWhitespace(data, index);

    if (data[index.value] === ']') return [];
    
    arr.push(parseValue(data, index));

    // keeps reading items until we reach the end
    while (data[index.value] !== ']'){
        if (data[index.value++] !== ',') return null;
        arr.push(parseValue(data, index));
    }
    index.value++;
    return arr;
}

// Converts the array to a string in CSV format
// Works for arrays of objects only
function arrayToCSV(arr){
    if (arr.length === 0) return "";

    // gets a complete set of all keys
    let keys = new Set(arr.flatMap(obj => Object.keys(obj)));
    keys = Array.from(keys);

    // for each object in the array, get the value of each key
    // if an object doesn't have a value for a certain key, the corresponding field will be '-'
    const lines = arr.map(obj =>
        keys.map(key => obj[key] ?? "-").join(",")
    );

    return keys.join(",") + "\n" + lines.join("\n");
}

function isValidString(str){
    let i, hex = 0;
    let escapeChar = false;
    for (i = 1; i < str.length; i++){
        if (escapeChar){
            if (!escapeSequences.includes(str[i])) return false;
            if (str[i] === 'u') hex = 1;
            escapeChar = false;
            continue;
        }
        if (hex > 0){
            if (!hexChars.includes(str[i])) return false;
            hex = (hex + 1) % 5; // back to zero after it reaches 4
            continue;
        }
        if (str[i] === "\\") escapeChar = true; continue;
    }
    return true;
}

// reads a number starting at data[index]. Does not store this number.
// Instead, it stores the index where the number ends.
// Returns true if there was a valid number to be read and false otherwise.
function readNumber(data, index){
    // Helper functions:
    function skipDigits(data, index){
        while (!endofData(data, index.value)){
            if (!("0123456789".includes(data[index.value]))) return;
            index.value++;
        }
    }
    function checkSpecialCases(data, index){
        switch (data[index.value++]) {
            case '.':
                return isFraction(data, index);
            case 'e':
            case 'E':
                return isExponent(data, index);
            default:
                index.value--;
                return true;
        }
    }
    function isFraction(data, index){
        const i = index.value;
        skipDigits(data, index);
        if (i === index.value) return false;
        if (data[index.value] === 'e' || data[index.value] === 'E'){
            index.value++;
            isExponent(data, index);
        }
        return true;
    }
    function isExponent(data, index){
        if (data[index.value] === '-' || data[index.value] === '+') index.value++;

        const i = index.value;
        skipDigits(data, index);
        return i !== index.value;
    }

    switch (data[index.value++]) {
        case '0':
            return checkSpecialCases(data, index);
        case '-':
            if (data[index.value] === '0'){
                index.value++;
                return checkSpecialCases(data, index);
            } else if ("123456789".includes(data[index.value])){
                skipDigits(data, index);
                return checkSpecialCases(data, index);
            } else {
                return false;
            }
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
            skipDigits(data, index);
            return checkSpecialCases(data, index);
        default:
            return false;
    }
}

// skips whitespace starting at str[index] and leaves 'index' one position after the whitespace.
// assumes 'index' is passed by reference
function skipWhitespace(str, index){
    while (index.value < str.length){
        if (!whitespace.includes(str[index.value])) break;
        index.value++;
    }
    return;
}

// returns true if 'index' exceeds the length of 'data'
function endofData(data, index){
    return index > data.length - 1;
}

function main(){
    const rl = readLine.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    console.log("Please enter a valid JSON file to be converted.");
    rl.question("File Name: ", (fileName) => {
        if(!fs.existsSync(fileName)) {
            console.log("File not found: " + '"' + fileName + '"');
            rl.close();
            return;
        }
        
        const jsonData = fs.readFileSync(fileName, "utf8");
        csvData = json2csv(jsonData);
        if (csvData === null) {
            console.log("The program wasn't able to create the CSV file.");
        } else {
            fs.writeFileSync("output.csv", csvData);
            console.log("The CSV file was successfully created under the name \"output.csv\".");
        } 
        rl.close();
    });
}

main();
