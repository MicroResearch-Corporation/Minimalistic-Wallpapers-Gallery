// document.addEventListener("DOMContentLoaded", () => {

//     function createTitle(el) {
//         if (el.hasAttribute("title")) return;

//         let t = "";

//         if (el.tagName === "IMG") {
//             t =
//                 el.getAttribute("alt") ||
//                 el.getAttribute("aria-label");

//             if (!t) {
//                 const src = el.getAttribute("src");
//                 if (src) t = src.split("/").pop().split("?")[0];
//             }
//         } else {
//             t =
//                 el.innerText?.trim() ||
//                 el.getAttribute("aria-label") ||
//                 el.value ||
//                 (el.tagName === "A" ? el.getAttribute("href") : "");
//         }

//         if (t && t.length > 1) {
//             el.setAttribute("title", t);
//         }
//     }

//     function scan(root = document) {
//         root.querySelectorAll("a, button, img").forEach(createTitle);
//     }

//     scan();

//     /* --- support dynamic elements (very small) --- */
//     new MutationObserver(m => {
//         m.forEach(x =>
//             x.addedNodes.forEach(n =>
//                 n.nodeType === 1 && scan(n)
//             )
//         );
//     }).observe(document.body, { childList: true, subtree: true });

//     /* ================= TOOLTIP (YOUR LOGIC, FIXED) ================= */

//     const style = document.createElement("style");
//     style.textContent = `
//         .custom-toast-tooltip {
//             position: fixed;
//             background: #fff;
//             color: #222;
//             padding: 8px 12px;
//             border-radius: 6px;
//             font: 700 12px system-ui;
//             z-index: 999999;
//             pointer-events: none;
//             opacity: 0;
//             transition: opacity .15s ease;
//             box-shadow: 0 4px 10px rgba(0,0,0,.25);
//             max-width: 280px;
//             line-height: 1.4;
//         }
//         .custom-toast-tooltip.visible { opacity: 1 }
//     `;
//     document.head.appendChild(style);

//     const tooltip = document.createElement("div");
//     tooltip.className = "custom-toast-tooltip";
//     document.body.appendChild(tooltip);

//     let active;

//     document.addEventListener("mouseover", e => {
//         const el = e.target.closest("[title]");
//         if (!el) return;

//         active = el;
//         tooltip.textContent = el.getAttribute("title");
//         tooltip.classList.add("visible");
//     });

//     document.addEventListener("mousemove", e => {
//         if (!active) return;

//         const pad = 14;
//         let x = e.clientX + pad;
//         let y = e.clientY + pad;

//         const r = tooltip.getBoundingClientRect();
//         if (x + r.width > innerWidth) x -= r.width + pad * 2;
//         if (y + r.height > innerHeight) y -= r.height + pad * 2;

//         tooltip.style.left = x + "px";
//         tooltip.style.top = y + "px";
//     });

//     document.addEventListener("mouseout", e => {
//         if (active && !active.contains(e.relatedTarget)) {
//             tooltip.classList.remove("visible");
//             active = null;
//         }
//     });

// });
