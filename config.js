// config.js
const fs = require('fs');

module.exports = {
    // 1. Auto React (Hi කිව්වම React කරන එක)
    AUTO_REACT: true, 
    
    // 2. Auto Voice (Hi කිව්වම Voice එකක් එවන එක)
    AUTO_VOICE: true, 
    
    // 3. Auto Status View (Status බැලූ සේ ලකුණු කිරීම)
    AUTO_STATUS_VIEW: true, 
    AUTO_STATUS_SAVE: true,

    // Auto Voice සදහා වචන සහ Audio Links
    VOICE_MAP: {
        'hi': 'https://media.vocaroo.com/mp3/1f8m55p05X4g', // Hi කිව්වම යන Voice එක
        'hello': 'https://media.vocaroo.com/mp3/1f8m55p05X4g',
        'bot': 'https://media.vocaroo.com/mp3/15C5Dqj8r8l8' // Bot කිව්වම යන එක (Sample)
    }
};
