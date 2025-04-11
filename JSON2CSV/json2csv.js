const fs = require('fs');

const hexChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
const escapeSequences = ['"', '\\', '/', 'b', 'f', 'n', 'r', 't', 'u']
const whitespace = [' ', '\n', '\r', '\t']

function json2csv(data){
    const lines = data.split('\n');
    let csvLines = []

    for (const line of lines){
        csvLines.push(parseLine(line));
    }
    return csvLines.join('\n');
}

// returns true if 'i' is the last position of 'line'
function endofLine(line, i){
    return i === line.length - 1;
}

function parseLine(line){
    let csvContent = ""
    switch (line[0]){
        case '{': { // Objects
            let index = { value: 1};
            let obj = {}

            if (line.length < 3){
                console.log("Error: Invalid JSON line.");
                return;
            }
            skipWhitespace(line, index);
            if (line[index] === '}' && endofLine(line, index)){
                // empty object
                // * do something *
            }
            parseObjectMember(obj, line, index);

            // keeps reading more members until we reach the end
            while (line[index] !== '}'){
                if (line[index] !== ','){
                    console.log("Error: Invalid JSON line.");
                    return;
                }
                parseObjectMember(obj, ++index);
            }

            // converts the object to csv lines
            let keysLine = '', valuesLine = ''
            for (const key in obj){
                keysLine += key;
                valuesLine += obj[key].toString();
            }
            csvContent = keysLine + '\n' + valuesLine;
            break;
        }
        case '[': { // Arrays
            let index = { value: 1};

            if (line.length < 3){
                console.log("Error: Invalid JSON line.");
                return;
            }

            skipWhitespace(line, index);
            if (line[index] === ']' && endofLine(line, index)){
                // empty array
                // * do something *
            }

            // * HANDLE VALUE *

            // keeps reading items until we reach the end
            while (line[index] !== ']'){
                if (line[index] !== ','){
                    console.log("Error: Invalid JSON line.");
                    return;
                }
                // * HANDLE VALUE *
            }

            if (!endofLine(line, index)){
                console.log("Error: Invalid JSON line.");
                return;
            }
        }
        default:
            console.log("Error: Invalid JSON line.");
            return;
    }
    return csvContent;
}

function parseObjectMember(obj, line, index){
    let str = '', val;
    
    skipWhitespace(line, index);
    if (line[index++] !== '"'){
        console.log("Error: Invalid JSON line.");
        return;
    }

    // consume characters to store in 'str'
    while (!(line[index] === '"' && line[index - 1] !== '\\')){
        if (endofLine(line, index)){
            console.log("Error: Invalid JSON line.");
            return;
        }
        str += line[index++];
    } 
    skipWhitespace(line, index);
    
    if (!isValidString(str)){
        console.log("Error: Invalid JSON line.");
        return;
    }
    if (line[index++] !== ':'){
        console.log("Error: Invalid JSON line.");
        return;
    }

    val = parseValue(index);

    obj[str] = val;
}

function parseValue(line, index){
    let str = line.slice(index);
    str = str.trim();

    // * verify if it's an object or array *

    if (isValidString(str) || isValidNumber(str) ||
        str === "true" || str === "false" || str === "null") return str;
}

function isValidString(str){
    if (str.length < 2) return false;
    if (str[0] !== '"') return false;
    if (str[1] === '"' && str.length == 2) return true;

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
    if (str[--i] !== "\"") return false;
    return true;
}

function isValidNumber(str){
    // Helper functions:
    function skipDigits(str, index){
        for (let i = index; i < str.length; i++)
            if (!("0123456789".includes(str[i]))) return i; 
        return -1; // reached the end
    }
    
    function checkSpecialCases(str, i){
        switch (str[i]) {
            case '.':
                return isFraction(str, i + 1);
            case 'e':
            case 'E':
                return isExponent(str, i + 1);
            default:
                return false;
        }
    }
    
    function isFraction(str, i){
        let j = skipDigits(str, i);
        if (j === -1) return true;
        if (str[j] === 'e' || str[j] === 'E') return isExponent(str, j + 1);
    }
    
    function isExponent(str, i){
        if (str[i] === '-' || str[i] === '+') i++;
        if (skipDigits(str, i) === -1) return true;
        return false;
    }

    let i;
    switch (str[0]) {
        case '0':
            return checkSpecialCases(str, 1);
        case '-':
            if (str[1] === '0') return checkSpecialCases(str, 2);
            if ((i = skipDigits(str, 1)) === -1) 
                break;
            else
                return checkSpecialCases(str, i);
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
            if ((i = skipDigits(str, 1)) === -1)
                break;
            else 
                return checkSpecialCases(str, i)
        default:
            return false;
    }
    return true;
}

// skips whitespace starting at str[index] and leaves 'index' one position after the whitespace
// assumes 'index' is passed by reference
function skipWhitespace(str, index){
    for (let i = index; i < str.length; i++){
        if (!whitespace.includes(str[index])) i--; return;
    }
}

function main(){
    const jsonData = fs.readFileSync("input.json", "utf8");
    csvData = json2csv(jsonData);
    fs.writeFile("output.csv", csvData);
}

main();
