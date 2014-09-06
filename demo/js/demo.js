var head = document.head;

function find(selector, context) {
  return (context || document).querySelector(selector);
}

function findAll(selector, context) {
  return (context || document).querySelectorAll(selector);
}

// function getLinkSource(href) {
//   var i = 0, styleSheets = document.styleSheets, len = styleSheets.length;
//   var source = '', parts;

//   parts = href.split('/');
//   href = parts[parts.length-1];

//   for(i; i < len; i += 1) {
//     if (styleSheets[i].href && styleSheets[i].href.indexOf(href) > -1) {
//       [].slice.call(styleSheets[i].cssRules).forEach(function(rule) {
//         source += rule.cssText + '\n';
//       });
//     }
//   }

//   return source;
// }

// function loadCodeSources() {
//   var codes = [].slice.call(findAll('code[class*="language-"]'));

//   codes.forEach(function(elem) {
//     var src = elem.getAttribute('src'), link, source;

//     if (src) {
//       link = document.createElement('link');
//       link.rel = 'stylesheet';
//       link.href = src;

//       link.onload = function() {
//         source = getLinkSource(src);
//         elem.innerHTML = source;
//         // console.log(source);
//       };

//       head.appendChild(link);
//     }
//   });
// }

// loadCodeSources();
