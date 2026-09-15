// ==========================================================================
// Meet Arnold Catalog - Pagination & Exploration Logic
// ==========================================================================

(function () {
  "use strict";

  const allEpisodes = typeof ARNOLD_LIBRARY !== "undefined" ? ARNOLD_LIBRARY : [];
  const ITEMS_PER_PAGE = 12; // Strictly 12 items per page to conserve bandwidth

  let currentCategory = "all";
  let searchQuery = "";
  let currentPage = 1;
  let filteredList = [];

  // DOM references
  const episodesGrid = document.getElementById("episodesGrid");
  const paginationNav = document.getElementById("paginationNav");
  const searchInput = document.getElementById("searchInput");
  const searchClear = document.getElementById("searchClear");
  const categoryTabs = document.querySelectorAll(".cat-tab");
  const categoryTabsContainer = document.getElementById("categoryTabs");
  const tabsScrollLeft = document.getElementById("tabsScrollLeft");
  const tabsScrollRight = document.getElementById("tabsScrollRight");
  const resultsCount = document.getElementById("resultsCount");
  const totalMatches = document.getElementById("totalMatches");
  const btnRandomTop = document.getElementById("btnRandomTop");

  function init() {
    updateCategoryCounts();
    applyFilters();
    bindEvents();
  }

  function updateCategoryCounts() {
    const counts = { all: allEpisodes.length };
    allEpisodes.forEach(ep => {
      counts[ep.category] = (counts[ep.category] || 0) + 1;
    });

    categoryTabs.forEach(tab => {
      const cat = tab.dataset.category;
      const countEl = tab.querySelector(".cat-pill-count");
      if (countEl && counts[cat] !== undefined) {
        countEl.textContent = counts[cat];
      }
    });
  }

  function applyFilters() {
    filteredList = allEpisodes.filter(ep => {
      if (currentCategory !== "all" && ep.category !== currentCategory) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = ep.title.toLowerCase().includes(q);
        const matchDesc = ep.description.toLowerCase().includes(q);
        const matchCat = ep.category_name.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCat) return false;
      }
      return true;
    });

    totalMatches.textContent = filteredList.length;

    // Validate current page bounds
    const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE) || 1;
    if (currentPage > totalPages) {
      currentPage = 1;
    }

    renderPage();
  }

  function renderPage() {
    const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE) || 1;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredList.length);
    const pageItems = filteredList.slice(startIndex, endIndex);

    resultsCount.textContent = pageItems.length;
    episodesGrid.innerHTML = "";

    if (pageItems.length === 0) {
      episodesGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 80px 20px;">
          <div style="font-size: 3rem; margin-bottom: 12px;">🔍</div>
          <h3 style="font-size: 1.25rem; color: #fff; margin-bottom: 8px;">No matching topics found</h3>
          <p style="color: var(--text-muted); font-size: 0.95rem;">Try adjusting your search terms or selecting a different category.</p>
        </div>
      `;
      paginationNav.innerHTML = "";
      return;
    }

    const fragment = document.createDocumentFragment();
    pageItems.forEach(item => {
      const card = document.createElement("article");
      card.className = "episode-card";
      card.innerHTML = `
        <div class="card-media">
          <img class="card-img" src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.onerror=null; this.src='image/ep_1.jpg';" />
          <div class="card-scrim">
            <div class="card-badge-top">
              <span class="card-cat-badge">${item.category_icon} ${item.category_name}</span>
            </div>
            <div class="card-play-btn" title="Watch episode">▶</div>
            <div></div>
          </div>
        </div>
        <div class="card-content">
          <div>
            <div class="card-ep-label">Topic #${String(item.id).padStart(3, '0')}</div>
            <h2 class="card-title" title="${item.title}">${item.title}</h2>
            <p class="card-desc" title="${item.description}">${item.description}</p>
          </div>
          <div class="card-footer-link">
            <span>Watch Episode</span>
            <span>→</span>
          </div>
        </div>
      `;

      // Navigate to dedicated video view page
      card.addEventListener("click", () => {
        window.location.href = `video.html?id=${item.id}&fromPage=${currentPage}`;
      });

      fragment.appendChild(card);
    });

    episodesGrid.appendChild(fragment);
    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    if (totalPages <= 1) {
      paginationNav.innerHTML = "";
      return;
    }

    let html = `
      <button class="page-btn" id="prevPageBtn" ${currentPage === 1 ? "disabled" : ""} aria-label="Previous page">
        ← Prev
      </button>
    `;

    // Windowed page numbers
    const visiblePages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) visiblePages.push(i);
    } else {
      visiblePages.push(1);
      if (currentPage > 3) visiblePages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) visiblePages.push(i);
      if (currentPage < totalPages - 2) visiblePages.push("...");
      visiblePages.push(totalPages);
    }

    visiblePages.forEach(p => {
      if (p === "...") {
        html += `<span class="page-dots">...</span>`;
      } else {
        html += `
          <button class="page-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">
            ${p}
          </button>
        `;
      }
    });

    html += `
      <button class="page-btn" id="nextPageBtn" ${currentPage === totalPages ? "disabled" : ""} aria-label="Next page">
        Next →
      </button>
    `;

    paginationNav.innerHTML = html;

    // Attach pagination listeners
    const prevBtn = document.getElementById("prevPageBtn");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
          currentPage--;
          renderPage();
          scrollToGrid();
        }
      });
    }

    const nextBtn = document.getElementById("nextPageBtn");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages) {
          currentPage++;
          renderPage();
          scrollToGrid();
        }
      });
    }

    paginationNav.querySelectorAll(".page-btn[data-page]").forEach(btn => {
      btn.addEventListener("click", () => {
        currentPage = parseInt(btn.dataset.page, 10);
        renderPage();
        scrollToGrid();
      });
    });
  }

  function scrollToGrid() {
    const el = document.getElementById("catalog");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function updateCategoryScrollButtons() {
    if (!categoryTabsContainer) return;
    const canScrollLeft = categoryTabsContainer.scrollLeft > 4;
    const canScrollRight = categoryTabsContainer.scrollLeft < (categoryTabsContainer.scrollWidth - categoryTabsContainer.clientWidth - 4);
    if (tabsScrollLeft) tabsScrollLeft.disabled = !canScrollLeft;
    if (tabsScrollRight) tabsScrollRight.disabled = !canScrollRight;
  }

  function bindEvents() {
    // Category tabs slider scroll buttons
    if (categoryTabsContainer) {
      categoryTabsContainer.addEventListener("scroll", updateCategoryScrollButtons, { passive: true });
      window.addEventListener("resize", updateCategoryScrollButtons, { passive: true });

      // Horizontal mouse wheel support over category tabs
      categoryTabsContainer.addEventListener("wheel", (e) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          categoryTabsContainer.scrollLeft += e.deltaY;
          updateCategoryScrollButtons();
        }
      }, { passive: false });

      // Initial check
      setTimeout(updateCategoryScrollButtons, 150);
    }

    if (tabsScrollLeft && categoryTabsContainer) {
      tabsScrollLeft.addEventListener("click", () => {
        categoryTabsContainer.scrollBy({ left: -240, behavior: "smooth" });
        setTimeout(updateCategoryScrollButtons, 350);
      });
    }

    if (tabsScrollRight && categoryTabsContainer) {
      tabsScrollRight.addEventListener("click", () => {
        categoryTabsContainer.scrollBy({ left: 240, behavior: "smooth" });
        setTimeout(updateCategoryScrollButtons, 350);
      });
    }

    // Category tabs click
    categoryTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        categoryTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        currentCategory = tab.dataset.category;
        currentPage = 1;
        applyFilters();

        // Smoothly bring clicked tab into view
        tab.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
        setTimeout(updateCategoryScrollButtons, 350);
      });
    });

    // Search input with debounce
    let timer = null;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(timer);
      searchQuery = e.target.value.trim();
      searchClear.style.display = searchQuery ? "block" : "none";
      timer = setTimeout(() => {
        currentPage = 1;
        applyFilters();
      }, 250);
    });

    searchClear.addEventListener("click", () => {
      searchInput.value = "";
      searchQuery = "";
      searchClear.style.display = "none";
      currentPage = 1;
      applyFilters();
      searchInput.focus();
    });

    // Random Top Button
    if (btnRandomTop) {
      btnRandomTop.addEventListener("click", () => {
        if (allEpisodes.length > 0) {
          const randItem = allEpisodes[Math.floor(Math.random() * allEpisodes.length)];
          window.location.href = `video.html?id=${randItem.id}&fromPage=1`;
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
