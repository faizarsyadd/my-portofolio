/*
  Premium Portfolio Script
  Features:
  - Dark/Light mode toggle with localStorage
  - Typing effect (Hero)
  - Scroll reveal animations (IntersectionObserver)
  - Active navbar link highlighting while scrolling
  - Mobile menu toggle
  - Project filtering
  - Project modal open/close
  - GitHub API fetch with skeleton loading + error handling
  - Form validation + toast notification
  - Back to top button
  - Smooth scrolling
  - Counter animation (About stats)
*/

"use strict";

/* =========================
   Config
========================= */
const githubUsername = "yourusername"; // <-- Change this to your GitHub username

/* =========================
   Helpers
========================= */
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

function formatDate(iso) {
  try {
    const date = new Date(iso);
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return "Unknown";
  }
}

/* =========================
   Intro Loader
========================= */
window.addEventListener("load", () => {
  const loader = $("#loader");
  setTimeout(() => {
    loader.classList.add("hidden");
  }, 3000); // Fallback hide after 5s
});
// load welcome end


/* =========================
   Footer Year
========================= */
$("#year").textContent = new Date().getFullYear();

/* =========================
   Theme Toggle (Dark/Light)
========================= */
const themeToggle = $("#themeToggle");
const themeIcon = $("#themeIcon");

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);

  if (theme === "light") {
    themeIcon.className = "fa-solid fa-sun";
  } else {
    themeIcon.className = "fa-solid fa-moon";
  }
}

(function initTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") {
    setTheme(saved);
  } else {
    setTheme("dark");
  }
})();

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  setTheme(current === "dark" ? "light" : "dark");
});

/* =========================
   Mobile Menu Toggle
========================= */
const menuToggle = $("#menuToggle");
const menuClose = $("#menuClose");
const mobileMenu = $("#mobileMenu");

function openMenu() {
  mobileMenu.classList.add("open");
  mobileMenu.setAttribute("aria-hidden", "false");
  menuToggle.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
}

function closeMenu() {
  mobileMenu.classList.remove("open");
  mobileMenu.setAttribute("aria-hidden", "true");
  menuToggle.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

menuToggle.addEventListener("click", openMenu);
menuClose.addEventListener("click", closeMenu);

mobileMenu.addEventListener("click", (e) => {
  if (e.target === mobileMenu) closeMenu();
});

$$(".mobile-menu__link").forEach((link) => {
  link.addEventListener("click", () => closeMenu());
});

/* =========================
   Smooth Scrolling (anchors)
========================= */
$$('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

/* =========================
   Typing Effect (Hero Role)
========================= */
const typingEl = $("#typingText");

const roles = [
  "Full Stack Developer | Laravel | PHP | JavaScript",
  "Building premium UI with clean architecture",
  "Fast, responsive, and scalable web apps"
];

let roleIndex = 0;
let charIndex = 0;
let deleting = false;

function typingLoop() {
  const currentRole = roles[roleIndex];

  if (!deleting) {
    charIndex++;
    typingEl.textContent = currentRole.slice(0, charIndex);

    if (charIndex >= currentRole.length) {
      deleting = true;
      setTimeout(typingLoop, 1200);
      return;
    }
  } else {
    charIndex--;
    typingEl.textContent = currentRole.slice(0, charIndex);

    if (charIndex <= 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }
  }

  const speed = deleting ? 28 : 38;
  setTimeout(typingLoop, speed);
}

typingLoop();

/* =========================
   Scroll Reveal (IntersectionObserver)
========================= */
const revealEls = $$(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealEls.forEach((el) => revealObserver.observe(el));

/* =========================
   Counter Animation (About Stats)
========================= */
const counters = $$(".stats__num");
let countersStarted = false;

function animateCounters() {
  if (countersStarted) return;
  countersStarted = true;

  counters.forEach((counter) => {
    const target = Number(counter.dataset.count || 0);
    const duration = 1200;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = clamp(elapsed / duration, 0, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);

      counter.textContent = value;

      if (progress < 1) requestAnimationFrame(tick);
      else counter.textContent = target;
    }

    requestAnimationFrame(tick);
  });
}

const aboutSection = $("#about");
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounters();
        counterObserver.disconnect();
      }
    });
  },
  { threshold: 0.25 }
);

counterObserver.observe(aboutSection);

/* =========================
   Active Navbar Link Highlight
========================= */
const sections = ["home", "about", "skills", "projects", "github", "timeline", "testimonials", "contact"]
  .map((id) => document.getElementById(id))
  .filter(Boolean);

const navLinks = $$(".nav__link");

function setActiveLink(id) {
  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    link.classList.toggle("active", href === `#${id}`);
  });
}

function onScrollActive() {
  const scrollPos = window.scrollY + 120;

  let current = "home";
  sections.forEach((sec) => {
    if (sec.offsetTop <= scrollPos) current = sec.id;
  });

  setActiveLink(current);
}

window.addEventListener("scroll", onScrollActive, { passive: true });
onScrollActive();

/* =========================
   Back To Top Button
========================= */
const backToTop = $("#backToTop");

function toggleBackTop() {
  if (window.scrollY > 700) backToTop.classList.add("show");
  else backToTop.classList.remove("show");
}

window.addEventListener("scroll", toggleBackTop, { passive: true });
toggleBackTop();

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* =========================
   Project Filtering
========================= */
const filterButtons = $$(".filter-btn");
const projectsGrid = $("#projectsGrid");
const projectCards = $$(".project", projectsGrid);

function applyFilter(filter) {
  projectCards.forEach((card) => {
    const category = card.dataset.category;
    const show = filter === "all" || category === filter;

    card.style.display = show ? "" : "none";
  });
}

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    applyFilter(btn.dataset.filter);
  });
});


// =========================
// Auto Slider + Smooth Transition
// =========================
const sliders = document.querySelectorAll(".slider");

sliders.forEach((slider) => {
  const slides = slider.querySelectorAll(".slide");
  let index = 0;

  slides.forEach((s) => s.classList.remove("active"));
  slides[0].classList.add("active");

  setInterval(() => {
    slides[index].classList.remove("active");
    index = (index + 1) % slides.length;
    slides[index].classList.add("active");
  }, 1000); // 1 detik
});




/* =========================
   Project Modal
========================= */
const projectModal = $("#projectModal");
const modalTitle = $("#modalTitle");
const modalDesc = $("#modalDesc");
const modalFeatures = $("#modalFeatures");
const modalTech = $("#modalTech");
const modalLive = $("#modalLive");
const modalGitHub = $("#modalGitHub");
const modalClose = $("#modalClose");

function openModal(projectEl) {
  const title = projectEl.dataset.title || "Project";
  const description = projectEl.dataset.description || "No description provided.";
  const features = (projectEl.dataset.features || "").split(",").map(s => s.trim()).filter(Boolean);
  const tech = (projectEl.dataset.tech || "").split(",").map(s => s.trim()).filter(Boolean);
  const live = projectEl.dataset.live || "#";
  const github = projectEl.dataset.github || "#";

  modalTitle.textContent = title;
  modalDesc.textContent = description;

  modalFeatures.innerHTML = "";
  features.forEach((f) => {
    const li = document.createElement("li");
    li.textContent = f;
    modalFeatures.appendChild(li);
  });

  modalTech.innerHTML = "";
  tech.forEach((t) => {
    const span = document.createElement("span");
    span.className = "badge-pill";
    span.textContent = t;
    modalTech.appendChild(span);
  });

  modalLive.href = live;
  modalGitHub.href = github;

  projectModal.classList.add("open");
  projectModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  projectModal.classList.remove("open");
  projectModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

$$(".project__details").forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".project");
    if (!card) return;
    openModal(card);
  });
});

modalClose.addEventListener("click", closeModal);
projectModal.addEventListener("click", (e) => {
  if (e.target?.dataset?.close === "true") closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && projectModal.classList.contains("open")) closeModal();
});

/* =========================
   GitHub API Fetch
========================= */
const githubGrid = $("#githubGrid");
const githubError = $("#githubError");

function renderGitHubSkeleton(count = 6) {
  githubGrid.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const sk = document.createElement("div");
    sk.className = "card glass repo skeleton";
    sk.innerHTML = `
      <div class="skeleton-line big"></div>
      <div class="skeleton-line med"></div>
      <div class="skeleton-line small"></div>
    `;
    githubGrid.appendChild(sk);
  }
}

function renderRepoCard(repo) {
  const card = document.createElement("article");
  card.className = "card glass repo reveal show";

  const stars = repo.stargazers_count ?? 0;
  const lang = repo.language ?? "—";
  const updated = formatDate(repo.updated_at);

  card.innerHTML = `
        <div class="repo__top">
      <h3 class="repo__name">
        <i class="fa-brands fa-github"></i>
        <a href="${repo.html_url}" target="_blank" rel="noopener">${repo.name}</a>
      </h3>
      <span class="repo__stars">
        <i class="fa-solid fa-star"></i> ${stars}
      </span>
    </div>

    <p class="repo__desc">
      ${repo.description ? repo.description : "No description provided."}
    </p>

    <div class="repo__meta">
      <span class="repo__pill">
        <i class="fa-solid fa-code"></i> ${lang}
      </span>
      <span class="repo__pill">
        <i class="fa-regular fa-clock"></i> ${updated}
      </span>
    </div>
  `;

  return card;
}

async function fetchGitHubRepos() {
  githubError.textContent = "";
  renderGitHubSkeleton(6);

  try {
    const url = `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=8`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const repos = await res.json();

    githubGrid.innerHTML = "";

    if (!Array.isArray(repos) || repos.length === 0) {
      githubError.textContent = "No repositories found. Please check your username.";
      return;
    }

    // Sort: stars desc, then updated desc
    repos
      .sort((a, b) => (b.stargazers_count - a.stargazers_count) || (new Date(b.updated_at) - new Date(a.updated_at)))
      .slice(0, 8)
      .forEach((repo) => {
        githubGrid.appendChild(renderRepoCard(repo));
      });
  } catch (err) {
    githubGrid.innerHTML = "";
    githubError.textContent =
      "Failed to load GitHub repositories. Please try again later.";
    console.error(err);
  }
}

fetchGitHubRepos();

/* =========================
   Testimonials Slider
========================= */
const slider = $("#testimonialSlider");
const slides = $$(".testimonial", slider);
const prevBtn = $("#testPrev");
const nextBtn = $("#testNext");
let currentSlide = 0;
let autoSlideTimer = null;

function updateSlider() {
  slides.forEach((s, i) => {
    s.classList.toggle("active", i === currentSlide);
  });
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  updateSlider();
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  updateSlider();
}

function startAutoSlide() {
  stopAutoSlide();
  autoSlideTimer = setInterval(nextSlide, 4500);
}

function stopAutoSlide() {
  if (autoSlideTimer) clearInterval(autoSlideTimer);
}

if (slides.length > 0) {
  updateSlider();
  startAutoSlide();

  nextBtn?.addEventListener("click", () => {
    nextSlide();
    startAutoSlide();
  });

  prevBtn?.addEventListener("click", () => {
    prevSlide();
    startAutoSlide();
  });

  slider.addEventListener("mouseenter", stopAutoSlide);
  slider.addEventListener("mouseleave", startAutoSlide);
}

/* =========================
   Toast Notification
========================= */
const toast = $("#toast");
const toastMsg = $("#toastMsg");

function showToast(message = "Success!", type = "success") {
  toast.classList.remove("success", "error");
  toast.classList.add("show", type);

  toastMsg.textContent = message;

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

/* =========================
   Contact Form Validation
========================= */
const contactForm = $("#contactForm");
const nameInput = $("#name");
const emailInput = $("#email");
const messageInput = $("#message");

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function setFieldError(inputEl, msg) {
  const field = inputEl.closest(".field");
  if (!field) return;

  field.classList.add("error");
  const small = field.querySelector(".field__error");
  if (small) small.textContent = msg;
}

function clearFieldError(inputEl) {
  const field = inputEl.closest(".field");
  if (!field) return;

  field.classList.remove("error");
  const small = field.querySelector(".field__error");
  if (small) small.textContent = "";
}

[nameInput, emailInput, messageInput].forEach((inp) => {
  inp.addEventListener("input", () => clearFieldError(inp));
});

contactForm.addEventListener("submit", (e) => {
  e.preventDefault();

  let valid = true;

  const nameVal = nameInput.value.trim();
  const emailVal = emailInput.value.trim();
  const msgVal = messageInput.value.trim();

  if (nameVal.length < 2) {
    setFieldError(nameInput, "Name must be at least 2 characters.");
    valid = false;
  }

  if (!isValidEmail(emailVal)) {
    setFieldError(emailInput, "Please enter a valid email address.");
    valid = false;
  }

  if (msgVal.length < 10) {
    setFieldError(messageInput, "Message must be at least 10 characters.");
    valid = false;
  }

  if (!valid) {
    showToast("Please fix the form errors.", "error");
    return;
  }

  // Demo only: show success toast and reset form
  contactForm.reset();
  showToast("Message sent successfully 🚀", "success");
});

/* =========================
   Extra Micro Interactions
========================= */
// Navbar shadow on scroll
const navbar = $("#navbar");

function navbarShadow() {
  if (window.scrollY > 12) navbar.classList.add("scrolled");
  else navbar.classList.remove("scrolled");
}

window.addEventListener("scroll", navbarShadow, { passive: true });
navbarShadow();

// Nice button press feedback
$$(".btn").forEach((btn) => {
  btn.addEventListener("mousedown", () => btn.classList.add("pressed"));
  btn.addEventListener("mouseup", () => btn.classList.remove("pressed"));
  btn.addEventListener("mouseleave", () => btn.classList.remove("pressed"));
});
