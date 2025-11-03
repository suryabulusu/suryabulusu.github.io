// Original embed snippet adapted from colah.github.io

const SHORTNAME = "stbv";

function appendDisqusScript(path) {
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://${SHORTNAME}.disqus.com/${path}`;
  const target =
    document.getElementsByTagName("head")[0] ||
    document.getElementsByTagName("body")[0];
  target.appendChild(script);
}

window.disqus_shortname = SHORTNAME;

appendDisqusScript("embed.js");
appendDisqusScript("count.js");
