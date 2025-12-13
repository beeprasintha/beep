// command.js
var commands = [];

function cmd(info, func) {
    var data = info;
    data.function = func;
    // Command එක හඳුනාගන්න pattern එක (Example: .song)
    data.pattern = new RegExp(`^(${info.pattern})`, 'i');
    commands.push(data);
    return data;
}

module.exports = {
    cmd,
    commands
};