var fs = require('fs'),
  path = require('path'),
  mime = require('mime'),
  helpers = require('./helper');

// This is non-sense, but mhtml have to use absolute path to the css files
// todo: this is temporary. configuration needs to be managed better,
// probably using a robust command line parser (nopt, optimist, commander).
var config = {
  host: 'http://example.com'
};

exports.cssMap = function cssMap(file) {
  return {
    file: path.resolve(file),
    content: helpers.toUTF(path.resolve(file))
  };
};

exports.cssEach = function cssEach(it) {
  // only work with single line declaration, eg.
  //
  //    #book_go { background: url(../images/embed/book_go.png); }
  //
  it.content = it.content.replace(/(.+)\{(.+url\(.+\).+)\}/gm, function(w, selector, block) {

    var ieholder = [
      '.ie6 :selector, .ie7 :selector {'.replace(/:selector/g, selector.trim()),
      block.replace(/url\((.+)\)/, function(w, url) {
        // first pass, simply putting a marker, this is non valid
        // mhtml syntax. Will be replaced properly on next step
        return 'mhtml(' + url + ')';
      }),
      '}',
      ''
    ].join('\n');

    return w + '\n' + ieholder;
  });
};


exports.cssDatauri = function cssDatauri(it) {
  var file = it.file,
    shortpath = it.file.replace(process.cwd(), ''),
    boundary = 'fooooobar',
    mhtml = ['Content-Type: multipart/related; boudary="' + boundary + '"\n\n'];

  // deal with datauris, replace inline url() by their base64 equivalent
  it.content = it.content.replace(/url\((.+)\)/g, function(w, url) {
    var cssfold = file.split('/').slice(0, -1).join('/'),
      imgpath = path.resolve(cssfold, url),
      base64 = helpers.toBase64(imgpath),
      mhtmlPart = [
        '--' + boundary,
        'Content-Location:' + url.split('/').slice(-1).join('/'),
        'Content-Transfer-Encoding:base64',
        '',
        base64,
        ''
      ].join('\n');

    mhtml.push(mhtmlPart);

    // leave url declaration as is if the img wasnt correctly referenced
    // eg. the css reference a non existing file, or their's problem in path
    return !base64 ? w : 'url(data:{mediatype};base64,{base64})'
      .replace('{mediatype}', mime.lookup(imgpath))
      .replace('{base64}', base64);
  });

  mhtml.push('--' + boundary + '--');

  it.content = '/* \n' + mhtml.join('\n') + '\n*/\n\n'  + it.content;

  // now replace inline mhtlm() reference
  it.content = it.content.replace(/mhtml\((.+)\)/g, function(w, url) {
    return helpers.getMHTML(shortpath, url.split('/').slice(-1).join('/'), config);
  });
};

exports.writeFiles = function writeFiles (item) {
  var file = item.file.replace(/\.css$/, '-datauri.css');
  console.log(' >> Generate ', file);
  fs.writeFileSync(file, item.content);
};
