var fs = require('fs');

var styles = {
  'nocolor'   : [0, 0],
  'bold'      : [1,  22],
  'inverse'   : [7,  27],
  'underline' : [4,  24],
  'yellow'    : [33, 39],
  'green'     : [32, 39],
  'red'       : [31, 39],
  'grey'      : [90, 39]
};

// ## function helper
exports.toBase64 = function toBase64(path) {
  try {
    return fs.readFileSync(path, 'base64');
  } catch(e) {
    console.error(stylize('Unable to locate ', stylize(path.replace(process.cwd(), ''), 'bold'), 'yellow'));
  }
};

exports.toUTF = function toUTF(path) {
  try {
    return fs.readFileSync(path, 'utf8');
  } catch(e) {
    console.error(stylize('Unable to locate ', stylize(path.replace(process.cwd(), ''), 'bold'), 'red'));
    console.error(stylize('Cannot proceed with a wrong list of files.', 'red'));
    process.exit(1);
  }
};

exports.getMHTML = function getMHTML(shortpath, ref, config) {
  return 'url(mhtml:$host!$ref)'
    .replace('$host', config.host + shortpath.replace(/\.css$/, '-datauri.css'))
    .replace('$ref', ref);
};

exports.help = function help() {
  // use of stdio instead of process.openStdin and stdout to avoid hitting
  // <Enter> to exit program after `:q` in man page.
  var stdio = process.binding('stdio'),
    ch = spawn('man', ['datauri'], {
      customFds: [stdio.stdinFD, stdio.stdoutFD, stdio.stderrFD]
    });

  ch.on('exit', function (code) {
    process.exit(code);
  });

  return ch;
};

// borrowed to cloudhead/less/stylize function
// last args would always be one of the configured styles below.
// If it's not, this means that no colors is applied.
exports.stylize = function stylize() {
  var args = Array.prototype.slice.call(arguments),
    color = styles[args[args.length - 1]],
    str = args.slice(0, color ? args.length - 1 : args.length).join('');

  color = color || styles['nocolor'];
  return '\033[' + color[0] + 'm' + str + '\033[' + color[1] + 'm';
};
