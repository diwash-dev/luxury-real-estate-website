// Aurelia Estates uses simple, sectioned JavaScript so each UI feature is easy to follow.
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const header = document.getElementById("siteHeader");
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("navMenu");
  const navLinks = document.querySelectorAll(".nav-link");
  const navSearch = document.getElementById("navSearch");
  const themeToggle = document.getElementById("themeToggle");
  const backToTop = document.getElementById("backToTop");
  const loader = document.getElementById("loader");
  const hero = document.querySelector(".hero");

  const hideLoader = () => {
    if (loader) {
      loader.classList.add("is-hidden");
    }
  };

  window.addEventListener("load", hideLoader);
  setTimeout(hideLoader, 1000);

  document.getElementById("currentYear").textContent = new Date().getFullYear();

  // Sticky navigation, back-to-top visibility, and a lightweight hero parallax effect.
  let ticking = false;

  function updateOnScroll() {
    const scrollY = window.scrollY;
    header.classList.toggle("scrolled", scrollY > 30);
    backToTop.classList.toggle("is-visible", scrollY > 650);

    if (hero && scrollY < hero.offsetHeight) {
      hero.style.setProperty("--hero-offset", `${scrollY * 0.18}px`);
    }

    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(updateOnScroll);
      ticking = true;
    }
  });

  updateOnScroll();

  function closeMobileMenu() {
    hamburger.classList.remove("is-open");
    hamburger.setAttribute("aria-expanded", "false");
    navMenu.classList.remove("is-open");
    body.classList.remove("menu-open");
  }

  hamburger.addEventListener("click", () => {
    const isOpen = hamburger.classList.toggle("is-open");
    hamburger.setAttribute("aria-expanded", String(isOpen));
    navMenu.classList.toggle("is-open", isOpen);
    body.classList.toggle("menu-open", isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  navSearch.addEventListener("click", () => {
    document.getElementById("home").scrollIntoView({ behavior: "smooth" });
    setTimeout(() => document.getElementById("heroLocation").focus(), 450);
  });

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Persist the selected theme without adding any external dependency.
  const savedTheme = localStorage.getItem("aurelia-theme");
  if (savedTheme === "light") {
    body.classList.add("light-mode");
  }

  themeToggle.addEventListener("click", () => {
    body.classList.toggle("light-mode");
    const activeTheme = body.classList.contains("light-mode") ? "light" : "dark";
    localStorage.setItem("aurelia-theme", activeTheme);
  });

  // Scroll reveal animations.
  const revealItems = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  // Active navigation link based on the section currently in view.
  const pageSections = document.querySelectorAll("main section[id]");
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-40% 0px -45% 0px" }
  );

  pageSections.forEach((section) => navObserver.observe(section));

  // Property filtering.
  const propertyCards = Array.from(document.querySelectorAll(".property-card"));
  const filterSearch = document.getElementById("filterSearch");
  const filterCategory = document.getElementById("filterCategory");
  const filterPrice = document.getElementById("filterPrice");
  const filterLocation = document.getElementById("filterLocation");
  const filterBedrooms = document.getElementById("filterBedrooms");
  const resetFilters = document.getElementById("resetFilters");
  const noResults = document.getElementById("noResults");

  function isPriceInRange(price, range) {
    if (!range) return true;

    const [min, max] = range.split("-").map(Number);
    return price >= min && price <= max;
  }

  function filterProperties() {
    const query = filterSearch.value.trim().toLowerCase();
    const selectedCategory = filterCategory.value;
    const selectedPrice = filterPrice.value;
    const selectedLocation = filterLocation.value;
    const selectedBedrooms = Number(filterBedrooms.value || 0);
    let visibleCount = 0;

    propertyCards.forEach((card) => {
      const cardPrice = Number(card.dataset.price);
      const cardBedrooms = Number(card.dataset.bedrooms);
      const matchesQuery = !query || card.dataset.search.includes(query);
      const matchesCategory = !selectedCategory || card.dataset.category === selectedCategory;
      const matchesPrice = isPriceInRange(cardPrice, selectedPrice);
      const matchesLocation = !selectedLocation || card.dataset.location === selectedLocation;
      const matchesBedrooms = !selectedBedrooms || cardBedrooms >= selectedBedrooms;
      const shouldShow = matchesQuery && matchesCategory && matchesPrice && matchesLocation && matchesBedrooms;

      card.hidden = !shouldShow;
      if (shouldShow) visibleCount += 1;
    });

    noResults.classList.toggle("is-visible", visibleCount === 0);
  }

  [filterSearch, filterCategory, filterPrice, filterLocation, filterBedrooms].forEach((control) => {
    control.addEventListener("input", filterProperties);
    control.addEventListener("change", filterProperties);
  });

  resetFilters.addEventListener("click", () => {
    filterSearch.value = "";
    filterCategory.value = "";
    filterPrice.value = "";
    filterLocation.value = "";
    filterBedrooms.value = "";
    filterProperties();
  });

  document.getElementById("heroSearch").addEventListener("submit", (event) => {
    event.preventDefault();

    filterSearch.value = document.getElementById("heroLocation").value.trim();
    filterCategory.value = document.getElementById("heroType").value;
    filterPrice.value = document.getElementById("heroPrice").value;
    filterProperties();
    document.getElementById("featured").scrollIntoView({ behavior: "smooth" });
  });

  document.querySelectorAll(".favorite-button").forEach((button) => {
    button.addEventListener("click", () => {
      const isFavorite = button.classList.toggle("is-favorite");
      button.setAttribute("aria-pressed", String(isFavorite));
    });
  });

  // Gallery lightbox.
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxClose = document.getElementById("lightboxClose");

  function openLightbox(image, caption) {
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = caption;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.src = "";
  }

  document.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("click", () => {
      const image = item.querySelector("img");
      openLightbox(image, item.dataset.caption);
    });
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }
  });

  // Animated counters start when the statistics section enters the viewport.
  const counters = document.querySelectorAll(".counter");

  function animateCounter(counter) {
    const target = Number(counter.dataset.target);
    const suffix = counter.dataset.suffix || "";
    const duration = 1600;
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(target * easedProgress);

      counter.textContent = `${currentValue.toLocaleString()}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    }

    requestAnimationFrame(updateCounter);
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.35 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));

  // Testimonial slider.
  const track = document.getElementById("testimonialTrack");
  const slides = Array.from(track.children);
  const dotsWrap = document.getElementById("testimonialDots");
  const prevButton = document.getElementById("prevTestimonial");
  const nextButton = document.getElementById("nextTestimonial");
  let currentSlide = 0;
  let sliderTimer;

  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.className = "slider-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Show testimonial ${index + 1}`);
    dot.addEventListener("click", () => {
      showSlide(index);
      restartSlider();
    });
    dotsWrap.appendChild(dot);
  });

  const dots = Array.from(dotsWrap.children);

  function showSlide(index) {
    currentSlide = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === currentSlide);
    });
  }

  function restartSlider() {
    clearInterval(sliderTimer);
    sliderTimer = setInterval(() => showSlide(currentSlide + 1), 5200);
  }

  prevButton.addEventListener("click", () => {
    showSlide(currentSlide - 1);
    restartSlider();
  });

  nextButton.addEventListener("click", () => {
    showSlide(currentSlide + 1);
    restartSlider();
  });

  showSlide(0);
  restartSlider();

  // Contact and newsletter forms are frontend-only demos.
  const contactForm = document.getElementById("contactForm");
  const formMessage = document.getElementById("formMessage");
  const newsletterForm = document.getElementById("newsletterForm");
  const newsletterMessage = document.getElementById("newsletterMessage");

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formMessage.textContent = "Thank you. A luxury advisor will contact you shortly.";
    contactForm.reset();
  });

  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    newsletterMessage.textContent = "Subscribed. Private listing notes are on the way.";
    newsletterForm.reset();
  });
});
