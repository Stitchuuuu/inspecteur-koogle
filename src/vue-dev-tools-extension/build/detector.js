(()=>{"use strict";var e={7650:(e,t)=>{function o(){}t.R=void 0,t.R=o},8585:(e,t,o)=>{function i(e){e.prototype.hasOwnProperty("$isChrome")||(Object.defineProperties(e.prototype,{$isChrome:{get:()=>t.isChrome},$isFirefox:{get:()=>t.isFirefox},$isWindows:{get:()=>t.isWindows},$isMac:{get:()=>t.isMac},$isLinux:{get:()=>t.isLinux},$keys:{get:()=>t.keys}}),t.isWindows&&document.body.classList.add("platform-windows"),t.isMac&&document.body.classList.add("platform-mac"),t.isLinux&&document.body.classList.add("platform-linux"))}t.keys=t.isLinux=t.isMac=t.isWindows=t.isFirefox=t.isChrome=t.target=t.isBrowser=void 0,t.isBrowser="undefined"!==typeof navigator,t.target=t.isBrowser?window:"undefined"!==typeof o.g?o.g:{},t.isChrome="undefined"!==typeof t.target.chrome&&!!t.target.chrome.devtools,t.isFirefox=t.isBrowser&&navigator.userAgent.indexOf("Firefox")>-1,t.isWindows=t.isBrowser&&0===navigator.platform.indexOf("Win"),t.isMac=t.isBrowser&&"MacIntel"===navigator.platform,t.isLinux=t.isBrowser&&0===navigator.platform.indexOf("Linux"),t.keys={ctrl:t.isMac?"&#8984;":"Ctrl",shift:"Shift",alt:t.isMac?"&#8997;":"Alt",del:"Del",enter:"Enter",esc:"Esc"}}},t={};function o(i){var s=t[i];if(void 0!==s)return s.exports;var r=t[i]={exports:{}};return e[i](r,r.exports,o),r.exports}(()=>{o.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()})();(()=>{var e=o(7650),t=o(8585);function i(e){setTimeout((()=>{var t,o=!(!window.__NUXT__&&!window.$nuxt);if(o)return window.$nuxt&&(t=window.$nuxt.$root.constructor),void e.postMessage({devtoolsEnabled:t&&t.config.devtools,vueDetected:!0,nuxtDetected:!0},"*");var i=!!window.__VUE__;if(i)e.postMessage({devtoolsEnabled:!0,vueDetected:!0},"*");else{for(var s,r=document.querySelectorAll("*"),n=0;n<r.length;n++)if(r[n].__vue__){s=r[n];break}if(s){var d=Object.getPrototypeOf(s.__vue__).constructor;while(d.super)d=d.super;e.postMessage({devtoolsEnabled:d.config.devtools,vueDetected:!0},"*")}}}),100)}function s(e){var o=";("+e.toString()+")(window)";if(t.isFirefox)window.eval(o);else{var i=document.createElement("script");i.textContent=o,document.documentElement.appendChild(i),i.parentNode.removeChild(i)}}window.addEventListener("message",(e=>{e.source===window&&e.data.vueDetected&&chrome.runtime.sendMessage(e.data)})),document instanceof HTMLDocument&&(s(i),s(e.R))})()})();