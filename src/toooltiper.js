
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("a, button, img").forEach((t) => {
        if (t.hasAttribute("title")) return;
        let e = "";
        if ("IMG" === t.tagName) {
            if (
                ((e = t.getAttribute("alt")),
                    e || (e = t.getAttribute("aria-label")),
                    !e)
            ) {
                const i = t.getAttribute("src");
                i && (e = i.split("/").pop().split("?")[0]);
            }
        } else
            (e = t.innerText?.trim()),
                e || (e = t.getAttribute("aria-label")),
                e || (e = t.value),
                e || "A" !== t.tagName || (e = t.getAttribute("href"));
        e && e.length > 1 && t.setAttribute("title", e);
    });
// ---------------------------------------------------
    (function tooltiper() {
        const style = document.createElement("style");
        style.textContent = `
        .custom-toast-tooltip {
            position: fixed;
            background: #ffffff;
            color: var(--primary-dark, #222);
            padding: 8px 12px;
            border-radius: 6px;
            font-family: system-ui, sans-serif;
            font-weight: 700;
            font-size: 12px;
            z-index: 999999;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.15s ease;
            box-shadow: 0 4px 10px rgba(0,0,0,.25);
            max-width: 280px;
            white-space: normal;
            line-height: 1.4;
        }
        .custom-toast-tooltip.visible {
            opacity: 1;
        }
    `;
        document.head.appendChild(style);
        const tooltip = document.createElement("div");
        tooltip.className = "custom-toast-tooltip";
        document.body.appendChild(tooltip);
        let active = null;
        document.addEventListener("mouseover", e => {
            const el = e.target.closest("[title],[data-toast-title]");
            if (!el) return;
            if (el.hasAttribute("title")) {
                const t = el.getAttribute("title");
                if (t) {
                    el.setAttribute("data-toast-title", t);
                    el.removeAttribute("title");
                }
            }
            const text = el.getAttribute("data-toast-title");
            if (!text) return;
            active = el;
            tooltip.textContent = text;
            tooltip.classList.add("visible");
        });
        document.addEventListener("mousemove", e => {
            if (!active) return;
            const pad = 14;
            const rect = tooltip.getBoundingClientRect();
            let x = e.clientX + pad;
            let y = e.clientY + pad;
            if (x + rect.width > window.innerWidth) {
                x = e.clientX - rect.width - pad;
            }
            if (y + rect.height > window.innerHeight) {
                y = e.clientY - rect.height - pad;
            }
            tooltip.style.left = x + "px";
            tooltip.style.top = y + "px";
        });
        document.addEventListener("mouseout", e => {
            if (!active) return;
            if (!active.contains(e.relatedTarget)) {
                tooltip.classList.remove("visible");
                active = null;
            }
        });
    })();
});