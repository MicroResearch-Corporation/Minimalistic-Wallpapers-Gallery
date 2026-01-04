
    const CONFIG = {
      json: "https://raw.githubusercontent.com/Pro-Bandey/minimalistic-wallpapers/output/images-meta.json",
      imageBase: "https://raw.githubusercontent.com/Pro-Bandey/minimalistic-wallpapers/main/",
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
      document.getElementById("sort-by").value = state.sort;

      const lSel = document.getElementById("layout-sel");
      const layouts = window.innerWidth < 768
        ? [{ id: "l-grid-large", n: "Grid" }, { id: "l-single", n: "Single" }, { id: "l-details", n: "Details" }]
        : [{ id: "l-grid-small", n: "Grid" },{ id: "l-grid-medium", n: "Grid Med" }, { id: "l-grid-large", n: "Grid Large" }, { id: "l-single", n: "Single" }, { id: "l-details", n: "Details" }, { id: "l-compact", n: "Compact" }];

      layouts.forEach((l) => {
        const o = document.createElement("option"); o.value = l.id; o.textContent = l.n;
        if (l.id === state.layout) o.selected = true;
        lSel.appendChild(o);
      });

      if (window.innerWidth > 768) {
        const  r = document.getElementById("cur-ring");
        document.addEventListener("mousemove", (e) => {
          r.style.left = e.clientX + "px"; r.style.top = e.clientY + "px";
          document.body.classList.toggle("is-ptr", !!e.target.closest("a, button, input, select, .card, .tab, .dots-btn, .field"));
          // change ring icon when over interactive
          const span = r.querySelector("span");
          if (document.body.classList.contains("is-ptr")) span.textContent = "pointer"; else span.textContent = "pan_tool_alt";
        });
      }

      await fetchFiles();
      const q = new URLSearchParams(window.location.search).get("q");
      if (q) document.getElementById("search-in").value = q;
      apply();
    }

    async function fetchFiles() {
      try {
        const res = await fetch(CONFIG.json, { cache: "no-store" });
        if (!res.ok) throw new Error("JSON fetch failed");
        const data = await res.json();
        const now = Date.now();
        const NEW_MS = CONFIG.NEW_DAYS * 86400000;

        allData = data.images.map(img => {
          const added = new Date(img.dates?.added || img.dates?.updated || Date.now()).getTime();
          const kb = typeof img.kb === "number" ? img.kb : (img.sizeBytes ? img.sizeBytes / 1024 : 0);
          return {
            raw: img,                       // preserve original object for advanced inspection
            id: img.id || "",
            name: img.name || img.src.split("/").pop(),
            url: CONFIG.imageBase + img.src,
            folder: img.folder || "root",
            path: img.src,
            ext: img.ext || (img.src.split(".").pop() || ""),
            type: (img.ext || (img.src.split(".").pop() || "")).toUpperCase(),
            kb: kb,
            rawSize: Math.round(kb * 1024),
            sizeStr: `${kb.toFixed(2)} KB`,
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
        console.error("Image JSON error:", e);
        alert("Failed to load images metadata.");
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

        // icons for meta rows
        const folderIcon = `<span class="material-icons" title="Folder">folder</span>`;
        const extIcon = `<span class="material-icons" style="vertical-align:middle;" title="File Type">image</span>`;
        const sizeIcon = `<span class="material-icons" title="Size">save</span>`;
        card.innerHTML = `
          <div class="img-hld">
            ${img.isNew ? '<div class="badge-rgb">NEW</div>' : ''}
            <img src="${img.url}" alt="${img.id}" loading="lazy" decoding="async" onload="setRes(this, ${gIdx})" style="aspect-ratio: 16 / 9; width:100%; height:auto;">
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
      // ensure we update the underlying items' res - there are two arrays (allData & filtered)
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
        b.onclick = () => { page = i; render(); window.scrollTo(0,0); };
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
          await navigator.clipboard.write([ new ClipboardItem({ [blob.type]: blob }) ]);
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
      shareU: (i) => navigator.share?.({ title: filtered[i].name, url: filtered[i].url })?.catch(()=>{}),
      
      // FIX IS INSIDE HERE
      props: (i) => {
        const img = filtered[i] || {};
        const raw = img.raw || {};
        const folderIcon = `<span class="material-icons" title="Folder" style="vertical-align:middle; font-size:15px;">folder</span>`;
        
        const added = (img.dates?.added ? new Date(img.dates.added) : (img.date ? new Date(img.date) : null));
        const updated = (img.dates?.updated ? new Date(img.dates.updated) : null);
        const addedStr=added?added.toLocaleDateString(void 0,{year:"numeric",month:"2-digit",day:"2-digit"}):"—";
        const updatedStr=updated?updated.toLocaleDateString(void 0,{year:"numeric",month:"2-digit",day:"2-digit"}):img.dates?.updated?new Date(img.dates.updated).toLocaleDateString(void 0,{year:"numeric",month:"2-digit",day:"2-digit"}):"—";
        const previewHtml = `<div class="prop-preview"><img src="${img.url}" alt="${img.id}" onload="this.classList.add('loaded')"></div>`;

        const list = [
          { l: "Filename", v: img.name || "—" },
          { l: "ID", v: img.id || "—" },
          { l: "Resolution", v: img.res || "—" },
          { l: "File Size", v: img.sizeStr + ` (${(img.rawSize || 0).toLocaleString()} bytes)` },
          { l: "Format", v: img.type || (img.ext || "—").toUpperCase() },
          { l: "Folder", v: `${folderIcon} ${img.folder || "—"}` },
          { l: "Repo Path", v: img.path || "—" },
          { l: "Added", v: addedStr },
          { l: "Updated", v: updatedStr },
          { l: "Hash", v: img.hash || "—" },
          { l: "Tags", v: (Array.isArray(img.tags) ? img.tags.join(", ") : (img.tags || "—")) }
        ];

        const listHtml = list.map(p => `
          <div class="prop-item">
            <div style="display:flex; gap:8px; align-items:center;">
              <span class="prop-label">${p.l}</span>
              <span class="prop-val" id="pv-${p.l.replace(/\s+/g,'-')}">${p.v}</span>
            </div>
            <div style="display:flex; gap:6px; align-items:center;">
              <button class="copy-btn" onclick="copyProp('${escapeForCopy(p.v)}')">Copy</button>
            </div>
          </div>`).join("");

        const rawJson = `<details open><summary style="cursor:pointer">Show raw JSON</summary><pre>${escapeHtml(JSON.stringify(raw, null, 2))}</pre></details>`;

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
        
        // --- THIS IS THE FIX FOR OPENING ---
        document.body.style.overflow = "hidden";
      }
    };




    function escapeHtml(s){ return String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'})[c]); }
    function escapeForCopy(s){ return (s === undefined || s === null) ? "" : String(s).replace(/'/g,"\\'").replace(/"/g,'\\"'); }

    function copyProp(text){
      try{
        navigator.clipboard.writeText(text);
        alert("Copied: " + (text.length > 120 ? text.slice(0,120) + "..." : text));
      }catch(e){
        alert("Copy failed: " + (e.message||e));
      }
    }

    function hideMenus(){ document.getElementById("m3-menu").style.display = "none"; }

    function openMenu(e, idx, ctx){
      if (e){ e.preventDefault(); e.stopPropagation(); }
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
        { k: "shareU", n: "Quick Share", i: "share" },
        { k: "props", n: "Properties", i: "info" }
      ];

      menu.innerHTML = list.map(it => `
        <button onclick="exec('${it.k}', ${idx})">
          <span class="material-icons" style="font-size:20px">${it.i}</span>
          <span>${it.n}</span>
        </button>
      `).join("");
      menu.style.display = "block";

      if (e && e.clientX){
        const x = Math.min(e.clientX, window.innerWidth - 260);
        const y = Math.min(e.clientY, window.innerHeight - list.length * 50);
        menu.style.left = x + "px"; menu.style.top = y + "px"; menu.style.transform = "none";
      } else {
        menu.style.left = "50%"; menu.style.top = "50%"; menu.style.transform = "translate(-50%,-50%)";
      }
    }

    function exec(k,i){
      hideMenus();
      if (k === "lb") openLB(i);
      else if (Actions[k]) Actions[k](i);
    }

    function openLB(i){
      curIdx = i;
      const img = filtered[i];
      document.getElementById("lb-img").src = img.url;
      document.getElementById("lightbox").style.display = "flex";
      document.body.style.overflow = "hidden";

      if (window.innerWidth > 768){
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

    function closeLB(){ document.getElementById("lightbox").style.display = "none"; 
  document.body.style.overflow = "auto"; 
    }
    function closeProps() {
      document.getElementById("prop-popup").style.display = "none";
      document.getElementById("prop-popup").setAttribute("aria-hidden", "true");
      
      // --- THIS IS THE FIX FOR CLOSING ---
      document.body.style.overflow = "auto";
    }
    function nav(d){ curIdx = (curIdx + d + filtered.length) % filtered.length; openLB(curIdx); }

    // Global Listeners & bindings
    document.getElementById("theme-tog").onclick = () => {
      document.body.classList.toggle("light");
      localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark");
    };
    document.getElementById("layout-sel").onchange = (e) => { localStorage.setItem("layout", e.target.value); render(); };
    
    document.getElementById("sort-by").onchange = (e) => { state.sort = e.target.value; localStorage.setItem("sort", e.target.value); apply(); };
    
    // document.getElementById("sort-order").onclick = () => { state.order = state.order === "asc" ? "desc" : "asc"; localStorage.setItem("order", state.order); apply(); };
    
    
    const btn = document.getElementById("sort-order");

btn.onclick = function () {
    state.order = state.order === "asc" ? "desc" : "asc";
    localStorage.setItem("order", state.order);

    this.style.transform =
        this.style.transform === "scaleY(-1)" ? "scaleY(1)" : "scaleY(-1)";

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


    // Touch gestures
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
