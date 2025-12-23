
// const CONFIG={owner:"MegaMind-Solution",repo:"MegaMind-Solution",path:"Img",limit:50};
const CONFIG = { owner: "Pro-Bandey", repo: "minimalistic-wallpapers", path: "images", limit: 50 };
let allData = [],
  filtered = [],
  curIdx = 0,
  page = 0;

const state = {
  theme: localStorage.getItem("theme") || "dark",
  layout:
    localStorage.getItem("layout") ||
    (window.innerWidth < 768 ? "l-grid-2" : "l-grid-3"),
  sort: localStorage.getItem("sort") || "name",
  order: localStorage.getItem("order") || "asc",
};

async function start() {
  // 1. Theme and UI State
  if (state.theme === "light") document.body.classList.add("light");
  document.getElementById("sort-by").value = state.sort;

  const lSel = document.getElementById("layout-sel");
  const layouts =
    window.innerWidth < 768
      ? [
          { id: "l-grid-2", n: "Grid" },
          { id: "l-single", n: "Single" },
          { id: "l-details", n: "Details" },
        ]
      : [
          { id: "l-grid-3", n: "Grid 3x" },
          { id: "l-grid-2", n: "Grid 2x" },
          { id: "l-single", n: "Single" },
          { id: "l-details", n: "Details" },
          { id: "l-compact", n: "Compact" },
        ];

  layouts.forEach((l) => {
    const o = document.createElement("option");
    o.value = l.id;
    o.textContent = l.n;
    if (l.id === state.layout) o.selected = true;
    lSel.appendChild(o);
  });

  // 2. Cursor (Desktop)
  if (window.innerWidth > 768) {
    const d = document.getElementById("cur-dot"),
      r = document.getElementById("cur-ring");
    document.addEventListener("mousemove", (e) => {
      d.style.left = e.clientX + "px";
      d.style.top = e.clientY + "px";
      r.style.left = e.clientX + "px";
      r.style.top = e.clientY + "px";
      document.body.classList.toggle(
        "is-ptr",
        !!e.target.closest("a, button, input, select, .card, .tab")
      );
    });
  }

  // 3. Fetch Data
  await fetchFiles();
  const q = new URLSearchParams(window.location.search).get("q");
  if (q) document.getElementById("search-in").value = q;

  apply();
}

async function fetchFiles() {
  try {
    const r = await fetch(
      `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${CONFIG.path}`
    );
    const data = await r.json();
    allData = data
      .filter((i) => /\.(webp|jpg|png|avif|jpeg)$/i.test(i.name))
      .map((i) => ({
        name: i.name,
        url: i.download_url,
        sizeStr: (i.size / 1024).toFixed(1) + " KB",
        rawSize: i.size,
        res: "...",
        resArea: 0,
        type: i.name.split(".").pop().toUpperCase(),
        folder: CONFIG.path,
        path: i.path,
      }));
  } catch (e) {
    console.error("GitHub API Error:", e);
  }
}

function apply() {
  const q = document.getElementById("search-in").value.toLowerCase();
  filtered = allData.filter((i) => i.name.toLowerCase().includes(q));

  const s = document.getElementById("sort-by").value;
  filtered.sort((a, b) => {
    let vA = a[s],
      vB = b[s];
    if (typeof vA === "string")
      return state.order === "asc"
        ? vA.localeCompare(vB)
        : vB.localeCompare(vA);
    return state.order === "asc" ? vA - vB : vB - vA;
  });
  page = 0;
  render();
}

function render() {
  const gal = document.getElementById("gallery");
  const lay = document.getElementById("layout-sel").value;
  gal.className = lay;
  gal.innerHTML = "";

  const startIdx = page * CONFIG.limit;
  const items = filtered.slice(startIdx, startIdx + CONFIG.limit);

  items.forEach((img, i) => {
    const gIdx = startIdx + i;
    const card = document.createElement("div");
    card.className = "card";
    card.onclick = () => openLB(gIdx);
    card.oncontextmenu = (e) => openMenu(e, gIdx, "card");

    // Long press detection
    let timer;
    card.ontouchstart = (e) =>
      (timer = setTimeout(() => openMenu(e, gIdx, "card"), 700));
    card.ontouchend = () => clearTimeout(timer);

    card.innerHTML = `
            <div class="img-hld"><img src="${
              img.url
            }" loading="lazy" onload="setRes(this, ${gIdx})"></div>
            <button class="dots-btn" onclick="openMenu(event, ${gIdx}, 'card')"><span class="material-icons">more_vert</span></button>
            <div class="card-meta">
                <span class="name">${img.name}</span>
                <span class="res" id="r-${gIdx}">${img.res}</span>
                ${
                  lay === "l-compact" || lay === "l-details"
                    ? `<div class="res">${img.sizeStr} • ${img.type}</div>`
                    : ""
                }
            </div>
        `;
    gal.appendChild(card);
  });
  renderTabs();
}

function setRes(img, idx) {
  const w = img.naturalWidth,
    h = img.naturalHeight;
  const r = `${w}x${h}`;
  filtered[idx].res = r;
  filtered[idx].resArea = w * h;
  img.classList.add("loaded");
  const el = document.getElementById(`r-${idx}`);
  if (el) el.innerText = r;
}

function renderTabs() {
  const t = document.getElementById("tabs");
  t.innerHTML = "";
  const pages = Math.ceil(filtered.length / CONFIG.limit);
  if (pages <= 1) return;
  for (let i = 0; i < pages; i++) {
    const b = document.createElement("button");
    b.className = `tab ${i === page ? "active" : ""}`;
    b.innerText = i + 1;
    b.onclick = () => {
      page = i;
      render();
      window.scrollTo(0, 0);
    };
    t.appendChild(b);
  }
}

const Actions = {
  tab: (i) => window.open(filtered[i].url, "_blank"),
  dl: async (i) => {
    const img = filtered[i];
    const blob = await fetch(img.url).then((r) => r.blob());
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = img.name;
    a.click();
  },
  copyI: async (i) => {
    const res = await fetch(filtered[i].url);
    const blob = await res.blob();
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      alert("Image copied to clipboard!");
    } catch (e) {
      alert("Copy failed: Browser restriction.");
    }
  },
  shareI: async (i) => {
    const b = await fetch(filtered[i].url).then((r) => r.blob());
    const f = new File([b], filtered[i].name, { type: b.type });
    if (navigator.canShare && navigator.canShare({ files: [f] }))
      navigator.share({ files: [f] });
  },
  copyU: (i) => {
    navigator.clipboard.writeText(filtered[i].url);
    alert("Link Copied!");
  },
  shareU: (i) =>
    navigator.share({ title: filtered[i].name, url: filtered[i].url }),
  props: (i) => {
    const img = filtered[i];
    const html = [
      { l: "Filename", v: img.name },
      { l: "Resolution", v: img.res },
      {
        l: "File Size",
        v: img.sizeStr + ` (${img.rawSize.toLocaleString()} bytes)`,
      },
      { l: "Format", v: img.type },
      { l: "Category", v: img.folder },
      { l: "Repo Path", v: img.path },
    ]
      .map(
        (p) =>
          `<div class="prop-item"><span class="prop-label">${p.l}</span><span style="text-transform: lowercase;font-family: monospace;">${p.v}</span></div>`
      )
      .join("");

    document.getElementById("prop-body").innerHTML = html;
    document.getElementById("prop-popup").style.display = "block";
  },
};

function hideMenus() {
  document.getElementById("m3-menu").style.display = "none";
}

// function openMenu(e, idx, ctx) {
//   if (e) {
//     e.preventDefault();
//     e.stopPropagation();
//   }
//   curIdx = idx;
//   const menu = document.getElementById("m3-menu");
//   const list =
//     ctx === "lb"
//       ? [
//           { k: "tab", n: "Open Tab", i: "open_in_new" },
//           { k: "dl", n: "Download", i: "download" },
//           { k: "copyI", n: "Copy Image", i: "content_copy" },
//           { k: "shareI", n: "Share File", i: "image" },
//           { k: "copyU", n: "Copy Link", i: "link" },
//           { k: "shareU", n: "Share Link", i: "share" },
//           { k: "props", n: "Details", i: "info" },
//         ]
//       : [
//           { k: "lb", n: "Open", i: "visibility" },
//           { k: "shareU", n: "Quick Share", i: "share" },
//           { k: "props", n: "Properties", i: "info" },
//         ];

//   menu.innerHTML = list
//     .map(
//       (it) =>
//         `<button onclick="exec('${it.k}', ${idx})"><span class="material-icons">${it.i}</span>${it.n}</button>`
//     )
//     .join("");
//   menu.style.display = "block";

//   if (e && e.clientX) {
//     const x = Math.min(e.clientX, window.innerWidth - 230);
//     const y = Math.min(e.clientY, window.innerHeight - list.length * 50);
//     menu.style.left = x + "px";
//     menu.style.top = y + "px";
//     menu.style.transform = "none";
//   } else {
//     menu.style.left = "50%";
//     menu.style.top = "50%";
//     menu.style.transform = "translate(-50%,-50%)";
//   }
// }

function openMenu(e, idx, ctx) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  curIdx = idx;
  const menu = document.getElementById("m3-menu");

  const list =
    ctx === "lb"
      ? [
          { k: "tab", n: "Open Tab", i: "open_in_new" },
          { k: "dl", n: "Download", i: "file_download" },
          { k: "copyI", n: "Copy Image", i: "perm_media" },
          { k: "shareI", n: "Share File", i: "image" },
          { k: "copyU", n: "Copy Link", i: "link" },
          { k: "shareU", n: "Share Link", i: "share" },
          { k: "props", n: "Details", i: "info" },
        ]
      : [
          { k: "lb", n: "Open", i: "visibility" },
          { k: "shareU", n: "Quick Share", i: "share" },
          { k: "props", n: "Properties", i: "info" },
        ];

  // Generate HTML with <span> for the icon
  menu.innerHTML = list
    .map(
      (it) => `
        <button onclick="exec('${it.k}', ${idx})">
            <span class="material-icons" style="font-size:20px">${it.i}</span>
            <span>${it.n}</span>
        </button>
    `
    )
    .join("");

  menu.style.display = "block";

  if (e && e.clientX) {
    const x = Math.min(e.clientX, window.innerWidth - 230);
    const y = Math.min(e.clientY, window.innerHeight - list.length * 50);
    menu.style.left = x + "px";
    menu.style.top = y + "px";
    menu.style.transform = "none";
  } else {
    menu.style.left = "50%";
    menu.style.top = "50%";
    menu.style.transform = "translate(-50%,-50%)";
  }
}

function exec(k, i) {
  hideMenus();
  if (k === "lb") openLB(i);
  else if (Actions[k]) Actions[k](i);
}

// function openLB(i) {
//   curIdx = i;
//   const img = filtered[i];
//   document.getElementById("lb-img").src = img.url;
//   document.getElementById("lightbox").style.display = "flex";

//   if (window.innerWidth > 768) {
//     const area = document.getElementById("lb-actions-dk");
//     const list = ["tab", "dl", "copyI", "shareI", "copyU", "shareU", "props"];
//     area.innerHTML = list
//       .map(
//         (k) =>
//           `<button class="field" onclick="Actions.${k}(${i})">${k.toUpperCase()}<span class="material-icons"></span></button>`
//       )
//       .join("");
//   }
// }

function openLB(i) {
  curIdx = i;
  const img = filtered[i];
  document.getElementById("lb-img").src = img.url;
  document.getElementById("lightbox").style.display = "flex";

  if (window.innerWidth > 768) {
    const area = document.getElementById("lb-actions-dk");

    const config = [
      { k: "tab", n: "Tab", i: "open_in_new" },
      { k: "dl", n: "Download", i: "file_download" },
      { k: "copyI", n: "Copy", i: "perm_media" },
      { k: "shareI", n: "Share", i: "image" },
      { k: "copyU", n: "Link", i: "link" },
      { k: "shareU", n: "Share Link", i: "share"  },
      { k: "props", n: "Properties", i: "info" },
    ];

    area.innerHTML = config
      .map(
        (it) => `
            <button class="field" onclick="Actions.${it.k}(${i})" style="display:inline-flex; align-items:center; gap:8px;">
                <span class="material-icons" style="font-size:18px">${it.i}</span>
                ${it.n}
            </button>
        `
      )
      .join("");
  }
}

function closeLB() {
  document.getElementById("lightbox").style.display = "none";
}
function nav(d) {
  curIdx = (curIdx + d + filtered.length) % filtered.length;
  openLB(curIdx);
}

// Global Listeners
document.getElementById("theme-tog").onclick = () => {
  document.body.classList.toggle("light");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("light") ? "light" : "dark"
  );
};
document.getElementById("layout-sel").onchange = (e) => {
  localStorage.setItem("layout", e.target.value);
  render();
};
document.getElementById("sort-by").onchange = (e) => {
  state.sort = e.target.value;
  localStorage.setItem("sort", e.target.value);
  apply();
};
document.getElementById("sort-order").onclick = () => {
  state.order = state.order === "asc" ? "desc" : "asc";
  localStorage.setItem("order", state.order);
  apply();
};
document.getElementById("search-in").oninput = (e) => {
  const url = new URL(window.location);
  if (e.target.value) url.searchParams.set("q", e.target.value);
  else url.searchParams.delete("q");
  window.history.replaceState({}, "", url);
  apply();
};

window.onscroll = hideMenus;
window.addEventListener("click", (e) => {
  if (!e.target.closest(".m3-menu") && !e.target.closest(".dots-btn"))
    hideMenus();
});

// Strictly Mobile-only Gestures
if ("ontouchstart" in window) {
  let ts = 0;
  document.getElementById("lightbox").ontouchstart = (e) =>
    (ts = e.touches[0].clientX);
  document.getElementById("lightbox").ontouchend = (e) => {
    const te = e.changedTouches[0].clientX;
    if (ts - te > 70) nav(1);
    if (te - ts > 70) nav(-1);
  };
}

start();
