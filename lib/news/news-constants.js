function define(name, value) {
  Object.defineProperty(exports, name, {
    value:      value,
    enumerable: true
  });
}

var editionsPostsFolder = {};
editionsPostsFolder["[not-a-link]"] = null; // nacional
editionsPostsFolder["minas-gerais"] = "minas-gerais";
editionsPostsFolder["pernambuco"] = "pernambuco";
editionsPostsFolder["rio-de-janeiro"] = "rio-de-janeiro";
editionsPostsFolder["sao-paulo"] = "sao-paulo";

var editionsLayout = {};
editionsLayout["[not-a-link]"] = "nacional";
editionsLayout["minas-gerais"] = "tabloide";
editionsLayout["pernambuco"] = "tabloide";
editionsLayout["rio-de-janeiro"] = "tabloide";
editionsLayout["sao-paulo"] = "tabloide";

define("editionsPostsFolder", editionsPostsFolder);
define("editionsLayout", editionsLayout);
