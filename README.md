# Minimalistic Wallpapers Gallery

## Minimalistic Wallpapers Gallery

A modern, fully client-side web gallery that dynamically loads, displays, filters, previews, and downloads images directly from a GitHub repository — without any backend.

---

## 📌 Project Purpose

The purpose of this project is to create a **lightweight, fast, and visually clean image gallery** that can be hosted entirely on static hosting platforms while using GitHub as a real-time content source.

Instead of manually updating galleries or uploading files to a server, this project automatically reads image folders from a GitHub repository and presents them in a professional gallery interface.

---

## 🎯 Why This Project Was Created

### 🚫 Problems With Traditional Galleries

* Require backend servers
* Manual uploads & maintenance
* Poor performance on large collections
* Lack of advanced filtering & layouts

### ✅ This Project Solves

* No backend required
* Images auto-sync from GitHub
* Handles hundreds or thousands of images
* Modern UX with minimal UI

---

## ✨ Key Features

### Materail Design+Glassomorphism UI Look

![Gallery Grid](https://iili.io/fjs7ln9.png)

Multiple layout modes (Grid Small, Grid Medium, Grid Large, Grid Single, Detail, Compact)

---

### Impressive Lightbox

![Lightbox Preview](https://iili.io/fjsGmjj.png)

Full-screen preview with navigation, keyboard support, touch gestures, metadata display, and quick actions.

---

---

### Advanced  Properties Panel

![Lightbox Preview](https://iili.io/fjsGgjf.png)

Full-screen preview with navigation, keyboard support, touch gestures, metadata display, and quick actions.

---

### Quickly Search Any Image/Images

![Search and Sort](https://iili.io/fjs5gh7.png)

Real-time search with URL sync, and easy to share to friend to easily access to your search images

---
---

### Sort By Your Choice

![Search and Sort](https://iili.io/fjs5PEu.png)

Real-time sorting by name, folder, resolution, file type, or random shuffle.

---

### Smart Pagination

![Tabs Pagination](https://iili.io/fjs7T3G.png)



---

This design ensures **maximum performance, zero hosting cost, instant scalability, and long-term maintainability**.

---

## 🧠 Technical Features (Behind the Scenes)

* IntersectionObserver for lazy loading
* Blur-up image loading technique
* Recursive GitHub API folder traversal
* Client-side resolution detection
* Blob-based file downloading
* Web Share API support
* Clipboard API integration
* LocalStorage theme persistence

---

## 🛠 Technologies Used

### [HTML5](./index.html)

Semantic structure, accessibility, and static hosting compatibility.

### [CSS3](./src/style.css)

Modern layout techniques (columns, grid), transitions, responsive design, and theme variables.

### [Vanilla JavaScript](./src/script.js)

No frameworks. Pure JavaScript for performance, portability, and long-term maintainability.

### [Workflow](https://github.com/Pro-Bandey/minimalistic-wallpapers/blob/main/.github/workflows/sync.yml)
that create databese in repo that contain images.
Used as a dynamic image database [images-meta.json](https://raw.githubusercontent.com/Pro-Bandey/minimalistic-wallpapers/output/images-meta.json), removing the need for a custom backend. and genrate all meta data of images in output branck

```metaData
{
  "version": 1,
  "generated_at": "2026-01-03T13:34:03.752Z",
  "total": 415,
  "duplicates": 0,
  "images": [
    {
      "id": "7b58699ccbce",
      "name": "Blue-mountain-landscape-background-illustration.jpg",
      "src": "images/Blue-mountain-landscape-background-illustration.jpg",
      "folder": "root",
      "ext": "jpg",
      "width": 0,
      "height": 0,
      "aspect_ratio": 0,
      "dpi": "72",
      "bit_depth": "8",
      "kb": 45.83,
      "hash": "7b58699ccbce69ad7766a6392afee206aafc2d878874b5e55e83d41c9b6d114d",
      "dates": {
        "added": "2026-01-03",
        "updated": "2026-01-03"
      }
    }
    other images meta.....
  ]
}
```

---

## 🎨 Design and Look

The UI follows **minimalistic + Material-Design 3 + Glassomorphism** layout rules and principles.
Controls stay subtle, images take priority, and animations are smooth but never distracting.

* Dark-mode first design
* Optional light mode
* Low visual noise
* Fast interactions

---

## 👥 Who This Project Is For

* Developers hosting image collections on GitHub
* Wallpaper curators
* Designers showcasing visual assets
* Static-site enthusiasts
* Open-source contributors

---

## 📖 Open-Source Philosophy

This project is fully open-source and built using only **web standards**.
No proprietary frameworks, no locked-in dependencies, and no paid services.

* Anyone can audit the code
* Anyone can fork and customize it
* Anyone can contribute improvements
* Anyone can self-host or extend it freely

The goal is to create a **reference-quality example** of how powerful modern browsers can be without backend complexity.

---

## 🤝 Contributing & Forking

Contributions are welcome and encouraged.
This project is designed to be **easy to fork, easy to understand, and easy to extend**.

### How to Contribute

* Fork the repository
* Create a feature or fix branch
* Keep changes clean and documented
* Submit a pull request

### What You Can Improve

* Performance optimizations
* UI/UX enhancements in Modern Ui Looks
* Accessibility improvements
* New gallery features
* Documentation & translations

Even small contributions — typo fixes, UI tweaks, or suggestions — are valuable and appreciated.

---

## ⭐ Why Give This Project a Star?

Starring this repository is not about popularity —
it’s about **supporting sustainable open-source work**.

* It helps others discover the project
* It signals that the project is useful or inspiring
* It motivates continued development and maintenance
* It supports open knowledge sharing

If this project helped you learn something, save time, or inspired your own work, a star **⭐** is a simple way to say “thank you”.

---

## 🚀 Future-Ready & Extensible

This architecture allows easy expansion:

* Favorites & collections
* EXIF data reading
* Offline caching (Service Workers)
* Tag-based filtering
* PWA support

---

© 2025 [Minimalistic Wallpapers Gallery](https://microresearch-corporation.github.io/Minimalistic-Wallpapers-Gallery/)
Powered by [MicroResearch Corporation](https://microresearch-corporation.github.io/) and Develop by [M Ramzan Ch](https://mramzanch.blogspot.com/)
