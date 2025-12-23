import { precacheAndRoute } from "workbox-precaching/precacheAndRoute";
precacheAndRoute([
  { revision: "aca1bee0de4de5483a220ab6d36ddb4c", url: "index.html" },
  { revision: "c135ec37f501bffd8ecde9ea87fded18", url: "src/script.js" },
  { revision: "8ffed0caa1dcd44bce4ffe307846fac7", url: "src/style.css" },
]);
