const CONFIG = {
  repos: [
        {
      name: "M W G",
      json: "https://raw.githubusercontent.com/Pro-Bandey/minimalistic-wallpapers/output/images-meta.json",
      base: "https://raw.githubusercontent.com/Pro-Bandey/minimalistic-wallpapers/main/"
    },
    // {
    //   name: "MegaMind",
    //   json: "https://raw.githubusercontent.com/MegaMind-Solution/MegaMind-Solution/output/images-meta.json",
    //   base: "https://raw.githubusercontent.com/MegaMind-Solution/MegaMind-Solution/main/"
    // }
  ],
  limit: 36,
  NEW_DAYS: 14
};

let allData = [], filtered = [], curIdx = 0, page = 0;
const state = {
  theme: localStorage.getItem("theme") || "dark",
  layout: localStorage.getItem("layout") || (window.innerWidth < 768 ? "l-grid-medium" : "l-grid-small"),
  sort: localStorage.getItem("sort") || "name",
  order: localStorage.getItem("order") || "asc"
};

async function start() {
  if (state.theme === "light") document.body.classList.add("light");

  const sortSel = document.getElementById("sort-by");
  if (sortSel && !sortSel.querySelector("option[value='source']")) {
    const opt = document.createElement("option");
    opt.value = "source";
    opt.textContent = "Source";
    sortSel.appendChild(opt);
  }
  if (sortSel) sortSel.value = state.sort;

  const lSel = document.getElementById("layout-sel");
  const layouts = window.innerWidth < 768
    ? [{ id: "l-grid-large", n: "Grid" }, { id: "l-single", n: "Single" }, { id: "l-details", n: "Details" }]
    : [{ id: "l-grid-small", n: "Grid" }, { id: "l-grid-medium", n: "Grid Med" }, { id: "l-grid-large", n: "Grid Large" }, { id: "l-single", n: "Single" }, { id: "l-details", n: "Details" }, { id: "l-compact", n: "Compact" }];

  layouts.forEach((l) => {
    const o = document.createElement("option"); o.value = l.id; o.textContent = l.n;
    if (l.id === state.layout) o.selected = true;
    lSel.appendChild(o);
  });



  await fetchFiles();
  const q = new URLSearchParams(window.location.search).get("q");
  if (q) document.getElementById("search-in").value = q;
  apply();
}
function formatSize(kb) {
  if (kb >= 1024) {
    return (kb / 1024).toFixed(2) + " MB";
  }
  return kb.toFixed(2) + " KB";
}
async function fetchFiles() {
  try {
    const repoPromises = CONFIG.repos.map(async (repo) => {
      try {
        const res = await fetch(repo.json, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed: ${repo.name}`);
        const data = await res.json();
        return data.images.map(img => ({
          ...img,
          _baseUrl: repo.base,
          source: repo.name
        }));
      } catch (err) {
        console.error(err);
        return [];
      }
    });

    const results = await Promise.all(repoPromises);
    const combinedImages = results.flat();

    const now = Date.now();
    const NEW_MS = CONFIG.NEW_DAYS * 86400000;

    allData = combinedImages.map(img => {
      const added = new Date(img.dates?.added || img.dates?.updated || Date.now()).getTime();
      const kb = typeof img.kb === "number" ? img.kb : (img.sizeBytes ? img.sizeBytes / 1024 : 0);

      return {
        raw: img,
        id: img.id || "",
        name: img.name || img.src.split("/").pop(),
        url: (img._baseUrl || "") + img.src,
        folder: img.folder || "root",
        source: img.source || "Unknown",
        path: img.src,
        ext: img.ext || (img.src.split(".").pop() || ""),
        type: (img.ext || (img.src.split(".").pop() || "")).toUpperCase(),
        kb: kb,
        rawSize: Math.round(kb * 1024),
        sizeStr: formatSize(kb),
        res: "...",
        resArea: 0,
        dates: img.dates || {},
        hash: img.hash || "",
        tags: img.tags || [],
        date: added,
        isNew: now - added <= NEW_MS
      };
    });

  } catch (e) {
    console.error("Critical Error:", e);
    alert("Failed to load images.");
  }
}

function apply() {
  const q = document.getElementById("search-in").value.toLowerCase();
  filtered = allData.filter((i) => i.name.toLowerCase().includes(q));
  const s = document.getElementById("sort-by").value;

  filtered.sort((a, b) => {
    if (s === "date") return state.order === "asc" ? a.date - b.date : b.date - a.date;
    const vA = a[s], vB = b[s];
    if (typeof vA === "string") return state.order === "asc" ? vA.localeCompare(vB) : vB.localeCompare(vA);
    return state.order === "asc" ? vA - vB : vB - vA;
  });
  page = 0; render();
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

    let timer;
    card.ontouchstart = (e) => (timer = setTimeout(() => openMenu(e, gIdx, "card"), 700));
    card.ontouchend = () => clearTimeout(timer);

    const folderIcon = `<span class="material-icons" title="Folder">folder</span>`;
    const extIcon = `<span class="material-icons" style="vertical-align:middle;" title="File Type">image</span>`;
    const sizeIcon = `<span class="material-icons" title="Size">save</span>`;

    card.innerHTML = `
          <div class="img-hld">
            ${img.isNew ? '<div class="badge-rgb">NEW</div>' : ''}
            <img src="${img.url}" alt="${img.name}" loading="lazy" decoding="async" onload="setRes(this, ${gIdx})" style="aspect-ratio: 16 / 9; width:100%; height:auto;">
          </div>
          <button class="dots-btn" onclick="openMenu(event, ${gIdx}, 'card')">
            <span class="material-icons">more_vert</span>
          </button>
          <div class="card-meta">
            <div class="name">${img.name}</div>
            <div class="res" id="r-${gIdx}">${img.res}</div>
            <div class="meta-row-icons">
              <span class="meta-file" title="File Size">${sizeIcon} ${img.sizeStr}</span>
              <span class="meta-file" title="Extension">${extIcon} ${img.type}</span>
              <span class="meta-file" title="Folder">${folderIcon} ${img.folder}</span>
            </div>
          </div>
        `;
    gal.appendChild(card);
  });
  renderTabs();
}

function setRes(imgEl, idx) {
  const w = imgEl.naturalWidth, h = imgEl.naturalHeight;
  const r = `${w}x${h}`;

  const item = filtered[idx];
  if (item) { item.res = r; item.resArea = w * h; }
  const id = item?.id;
  if (id) {
    const a = allData.find(x => x.id === id);
    if (a) { a.res = r; a.resArea = w * h; }
  }
  imgEl.classList.add("loaded");
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
    b.onclick = () => { page = i; render(); window.scrollTo(0, 0); };
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
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      alert("Image copied to clipboard!");
    } catch (e) {
      alert("Copy failed: Browser restriction.");
    }
  },
  shareI: async (i) => {
    const b = await fetch(filtered[i].url).then((r) => r.blob());
    const f = new File([b], filtered[i].name, { type: b.type });
    if (navigator.canShare && navigator.canShare({ files: [f] })) navigator.share({ files: [f] });
  },
  copyU: (i) => { navigator.clipboard.writeText(filtered[i].url); alert("Link Copied!"); },
  shareU: (i) => navigator.share?.({ title: filtered[i].name, url: filtered[i].url })?.catch(() => { }),

  props: (i) => {
    const img = filtered[i] || {};
    const iconid = `<span class="material-icons" title="Folder" style="vertical-align:middle; font-size:15px;">new_releases</span>`;
    const iconSource = `<span class="material-icons" title="Folder" style="vertical-align:middle; font-size:15px;">source</span>`;
    const iconWidth = `<span class="material-icons" title="Folder" style="vertical-align:middle; rotate: 90deg; font-size:15px;">height</span>`;
    const iconHeight = `<span class="material-icons" title="Folder" style="vertical-align:middle; font-size:15px;">height</span>`;
    const iconAspect = '<span class="material-icons" title="Folder" style="vertical-align:middle; font-size:15px;">aspect_ratio</span>'
    const iconReso = '<span class="material-icons" title="Folder" style="vertical-align:middle; font-size:15px;">photo_size_select_large</span>'
    const iconSize = `<span class="material-icons" title="Folder" style="vertical-align:middle; font-size:15px;">storage</span>`;
    const iconType = `<span class="material-icons" title="Folder" style="vertical-align:middle; font-size:15px;">type_specimen</span>`;
    const iconFolder = `<span class="material-icons" title="Folder" style="vertical-align:middle; font-size:15px;">folder</span>`;
    const iconRepo = `<span class="material-icons" title="Folder" style="vertical-align:middle; font-size:15px;">account_tree</span>`;
    const iconDate = `<span class="material-icons" title="Folder" style="vertical-align:middle; font-size:15px;">date_range</span>`;
    const iconHash = `<span class="material-icons" title="Folder" style="vertical-align:middle; font-size:15px;">tag</span>`;
    const iconTags = `<span class="material-icons" title="Folder" style="vertical-align:middle; font-size:15px;">description</span>`;



    const added = (img.dates?.added ? new Date(img.dates.added) : (img.date ? new Date(img.date) : null));
    const updated = (img.dates?.updated ? new Date(img.dates.updated) : null);
    const addedStr = added ? added.toLocaleDateString(void 0, { year: "numeric", month: "2-digit", day: "2-digit" }) : "—";
    const updatedStr = updated ? updated.toLocaleDateString(void 0, { year: "numeric", month: "2-digit", day: "2-digit" }) : "—";

    // --- Calculate Dimensions & Aspect Ratio ---
    let w = 0, h = 0, ar = 0, arStr = "—";
    if (img.res && img.res !== "...") {
      const parts = img.res.split("x");
      w = parseInt(parts[0]) || 0;
      h = parseInt(parts[1]) || 0;
      if (w > 0 && h > 0) {
        ar = parseFloat((w / h).toFixed(3));
        arStr = ar.toString();
      }
    }

    const displayRaw = {
      ...img.raw,
      source: img.source, 
      width: w,
      height: h,
      aspect_ratio: ar
    };
    const jsonString = JSON.stringify(displayRaw, null, 2);

    const previewHtml = `<div class="prop-preview"><img src="${img.url}" alt="${img.name}" onload="this.classList.add('loaded')"></div>`;

    const list = [
      { l: "Filename", v: img.name || "—" },
      { l: "ID", v: `${iconid} ${img.id || "—"}` },
      { l: "Source", v: `${iconSource} ${img.source || "—"}` },
      { l: "Width", v: `${iconWidth} ${w ? w + "px" : "—"}` },
      { l: "Height", v: `${iconHeight} ${h ? h + "px" : "—"}` },
      { l: "Aspect Ratio", v: `${iconAspect} ${arStr}` },
      { l: "Resolution", v: `${iconReso} ${img.res || "—"}` },
      { l: "File Size", v: `${iconSize} ${img.sizeStr + ` (${(img.rawSize || 0).toLocaleString()}bytes)`}` },
      { l: "Format", v: `${iconType} ${img.type || (img.ext || "—").toUpperCase()}` },
      { l: "Folder", v: `${iconFolder} ${img.folder || "—"}` },
      { l: "Repo Path", v: `${iconRepo} ${img.path || "—"}` },
      { l: "Added", v: `${iconDate} ${addedStr}` },
      { l: "Updated", v: `${iconDate} ${updatedStr}` },
      { l: "Hash", v: `${iconHash} ${img.hash || "—" }` },
      { l: "Tags", v: `${iconTags} ${(Array.isArray(img.tags) ? img.tags.join(", ") : (img.tags || "—"))}` }
    ];

    const listHtml = list.map(p => {
      const showCopy = p.l === "Filename";
      return `
          <div class="prop-item">
            <div style="display:flex; gap:8px; align-items:center;">
              <span class="prop-label">${p.l}</span>
              <span class="prop-val" id="pv-${p.l.replace(/\s+/g, '-')}">${p.v}</span>
            </div>
            ${showCopy ?
          `<div style="display:flex; gap:6px; align-items:center;">
                 <button class="field copy" onclick="copyProp('${escapeForCopy(p.v)}')">
                   <span class="material-icons">content_copy</span>
                 </button>
               </div>`
          : ''}
          </div>`;
    }).join("");

    // --- RAW JSON SECTION (FIXED WITH ICON) ---
    const rawJson = `
          <details open>
            <summary style="cursor:pointer; display:flex; align-items:center; justify-content:space-between; outline:none;">
              <span>Show raw JSON</span>
              <span>Copy Json:<button class="field copy" onclick="copyProp(decodeURIComponent('${encodeURIComponent(jsonString)}'))"><span class="material-icons">content_copy</span></button></span>
            </summary>
            <pre>${escapeHtml(jsonString)}</pre>
          </details>`;

    const html = `
          <div class="prop-grid">
            ${previewHtml}
            <div class="prop-list">
              ${listHtml}
              ${rawJson}
            </div>
          </div>
        `;

    document.getElementById("prop-body").innerHTML = html;
    document.getElementById("prop-popup").style.display = "block";
    document.getElementById("prop-popup").setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
};

function escapeHtml(s) { return String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]); }
function escapeForCopy(s) { return (s === undefined || s === null) ? "" : String(s).replace(/'/g, "\\'").replace(/"/g, '\\"'); }

function copyProp(text) {
  try {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  } catch (e) {
    alert("Copy failed: " + (e.message || e));
  }
}

function hideMenus() { document.getElementById("m3-menu").style.display = "none"; }

function openMenu(e, idx, ctx) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  curIdx = idx;
  const menu = document.getElementById("m3-menu");
  const list = ctx === "lb" ? [
    { k: "tab", n: "Open Tab", i: "open_in_new" },
    { k: "dl", n: "Download", i: "file_download" },
    { k: "copyI", n: "Copy Image", i: "perm_media" },
    { k: "shareI", n: "Share File", i: "image" },
    { k: "copyU", n: "Copy Link", i: "link" },
    { k: "shareU", n: "Share Link", i: "share" },
    { k: "props", n: "Details", i: "info" }
  ] : [
    { k: "lb", n: "Open", i: "visibility" },
    { k: "dl", n: "Download", i: "file_download" },
    { k: "shareU", n: "Quick Share", i: "share" },
    { k: "props", n: "Properties", i: "info" }
  ];

  menu.innerHTML = list.map(it => `
        <button title="${it.n}" onclick="exec('${it.k}', ${idx})">
          <span class="material-icons" style="font-size:20px">${it.i}</span>
          <span>${it.n}</span>
        </button>
      `).join("");
  menu.style.display = "block";

  if (e && e.clientX) {
    const x = Math.min(e.clientX, window.innerWidth - 260);
    const y = Math.min(e.clientY, window.innerHeight - list.length * 50);
    menu.style.left = x + "px"; menu.style.top = y + "px"; menu.style.transform = "none";
  } else {
    menu.style.left = "50%"; menu.style.top = "50%"; menu.style.transform = "translate(-50%,-50%)";
  }
}

function exec(k, i) {
  hideMenus();
  if (k === "lb") openLB(i);
  else if (Actions[k]) Actions[k](i);
}

function openLB(i) {
  curIdx = i;
  const img = filtered[i];
  document.getElementById("lb-img").src = img.url;
  document.getElementById("lightbox").style.display = "flex";
  document.body.style.overflow = "hidden";

  if (window.innerWidth > 768) {
    const area = document.getElementById("lb-actions-dk");
    const config = [
      { k: "tab", n: "Tab", i: "open_in_new" },
      { k: "dl", n: "Download", i: "file_download" },
      { k: "copyI", n: "Copy", i: "perm_media" },
      { k: "shareI", n: "Share", i: "image" },
      { k: "copyU", n: "Link", i: "link" },
      { k: "shareU", n: "Share Link", i: "share" },
      { k: "props", n: "Properties", i: "info" }
    ];
    area.innerHTML = config.map(it => `
          <button class="field" onclick="Actions.${it.k}(${i})" style="display:inline-flex; align-items:center; gap:8px;">
            <span class="material-icons" style="font-size:18px">${it.i}</span> ${it.n}
          </button>
        `).join("");
  }
}

function closeLB() {
  document.getElementById("lightbox").style.display = "none";
  document.body.style.overflow = "auto";
}

function closeProps() {
  document.getElementById("prop-popup").style.display = "none";
  document.getElementById("prop-popup").setAttribute("aria-hidden", "true");
  document.body.style.overflow = "auto";
}

function nav(d) { curIdx = (curIdx + d + filtered.length) % filtered.length; openLB(curIdx); }

document.getElementById("theme-tog").onclick = () => {
  document.body.classList.toggle("light");
  localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark");
};
document.getElementById("layout-sel").onchange = (e) => { localStorage.setItem("layout", e.target.value); render(); };

document.getElementById("sort-by").onchange = (e) => { state.sort = e.target.value; localStorage.setItem("sort", e.target.value); apply(); };

const btn = document.getElementById("sort-order");
btn.onclick = function () {
  state.order = state.order === "asc" ? "desc" : "asc";
  localStorage.setItem("order", state.order);
  this.style.transform = this.style.transform === "scaleY(-1)" ? "scaleY(1)" : "scaleY(-1)";
  apply();
};
const savedOrder = localStorage.getItem("order");
if (savedOrder === "desc") {
  state.order = "desc";
  btn.style.transform = "scaleY(-1)";
} else {
  state.order = "asc";
  btn.style.transform = "scaleY(1)";
}

document.getElementById("search-in").oninput = (e) => { const url = new URL(window.location); if (e.target.value) url.searchParams.set("q", e.target.value); else url.searchParams.delete("q"); window.history.replaceState({}, "", url); apply(); };

window.onscroll = hideMenus;
window.addEventListener("click", (e) => { if (!e.target.closest(".m3-menu") && !e.target.closest(".dots-btn")) hideMenus(); });

if ("ontouchstart" in window) {
  let ts = 0;
  document.getElementById("lightbox").ontouchstart = (e) => (ts = e.touches[0].clientX);
  document.getElementById("lightbox").ontouchend = (e) => {
    const te = e.changedTouches[0].clientX;
    if (ts - te > 70) nav(1);
    if (te - ts > 70) nav(-1);
  };
}

start();