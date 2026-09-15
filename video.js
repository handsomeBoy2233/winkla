// ==========================================================================
// Meet Arnold - Dedicated Episode View Page Logic
// Image-as-Player Architecture: Click to Play
// ==========================================================================

(function () {
  "use strict";

  const allEpisodes = typeof ARNOLD_LIBRARY !== "undefined" ? ARNOLD_LIBRARY : [];

  // Parse URL query params
  const urlParams = new URLSearchParams(window.location.search);
  const targetId = parseInt(urlParams.get("id"), 10) || 1;
  const fromPage = parseInt(urlParams.get("fromPage"), 10) || 1;

  // Locate Episode
  const currentVideo = allEpisodes.find(v => v.id === targetId) || allEpisodes[0];

  // DOM references
  const btnBackCatalog = document.getElementById("btnBackCatalog");
  const breadcrumbCategory = document.getElementById("breadcrumbCategory");
  const breadcrumbTitle = document.getElementById("breadcrumbTitle");
  const badgeCategory = document.getElementById("badgeCategory");
  const badgeEpisodeNum = document.getElementById("badgeEpisodeNum");
  const videoPageTitle = document.getElementById("videoPageTitle");
  const playerBox = document.getElementById("playerBox");
  const playerPosterImg = document.getElementById("playerPosterImg");
  const videoSynopsis = document.getElementById("videoSynopsis");
  const btnLaunchStream = document.getElementById("btnLaunchStream");
  const btnCopyEmbed = document.getElementById("btnCopyEmbed");
  const btnPrevEpisode = document.getElementById("btnPrevEpisode");
  const btnNextEpisode = document.getElementById("btnNextEpisode");
  const btnRandomEpisode = document.getElementById("btnRandomEpisode");
  const relatedGrid = document.getElementById("relatedGrid");
  const toast = document.getElementById("toast");

  function init() {
    if (!currentVideo) return;

    // Document Title
    document.title = `${currentVideo.title} • Meet Arnold`;

    // Back to Catalog link
    btnBackCatalog.href = `index.html#catalog`;

    // Populate Headers & Meta
    breadcrumbCategory.textContent = currentVideo.category_name;
    breadcrumbTitle.textContent = currentVideo.title;
    badgeCategory.textContent = `${currentVideo.category_icon} ${currentVideo.category_name}`;
    badgeEpisodeNum.textContent = `Topic #${String(currentVideo.id).padStart(3, '0')}`;
    videoPageTitle.textContent = currentVideo.title;
    videoSynopsis.textContent = currentVideo.description;

    // Poster Image as Player
    playerPosterImg.onerror = function() {
      this.onerror = null;
      this.src = "image/ep_1.jpg";
    };
    playerPosterImg.src = currentVideo.image;
    playerPosterImg.alt = currentVideo.title;

    // Play Video: Open destination stream
    function playVideo() {
      if (currentVideo.embed_url) {
        window.location.href = currentVideo.embed_url;
      }
    }

    // Click poster image, button or zhicheng element -> play
    playerBox.addEventListener("click", playVideo);
    btnLaunchStream.addEventListener("click", playVideo);
    const zhichengEl = document.getElementById("zhicheng");
    if (zhichengEl) {
      zhichengEl.addEventListener("click", (e) => {
        e.stopPropagation();
        playVideo();
      });
    }

    // Copy link button
    btnCopyEmbed.addEventListener("click", () => {
      if (currentVideo.embed_url) {
        navigator.clipboard.writeText(currentVideo.embed_url).then(() => {
          showToast("📋 Link copied to clipboard!");
        }).catch(() => {
          showToast("Link: " + currentVideo.embed_url);
        });
      }
    });

    // Navigation buttons
    const currentIndex = allEpisodes.findIndex(v => v.id === currentVideo.id);

    btnPrevEpisode.addEventListener("click", () => {
      const prevIdx = (currentIndex - 1 + allEpisodes.length) % allEpisodes.length;
      window.location.href = `video.html?id=${allEpisodes[prevIdx].id}&fromPage=${fromPage}`;
    });

    btnNextEpisode.addEventListener("click", () => {
      const nextIdx = (currentIndex + 1) % allEpisodes.length;
      window.location.href = `video.html?id=${allEpisodes[nextIdx].id}&fromPage=${fromPage}`;
    });

    btnRandomEpisode.addEventListener("click", () => {
      const randIdx = Math.floor(Math.random() * allEpisodes.length);
      window.location.href = `video.html?id=${allEpisodes[randIdx].id}&fromPage=${fromPage}`;
    });

    // Populate Related Episodes (Same Category)
    renderRelated();
  }

  function renderRelated() {
    const related = allEpisodes.filter(v => v.category === currentVideo.category && v.id !== currentVideo.id).slice(0, 3);
    relatedGrid.innerHTML = "";

    related.forEach(item => {
      const card = document.createElement("article");
      card.className = "episode-card";
      card.innerHTML = `
        <div class="card-media">
          <img class="card-img" src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.onerror=null; this.src='image/ep_1.jpg';" />
          <div class="card-scrim">
            <div class="card-badge-top">
              <span class="card-cat-badge">${item.category_icon} ${item.category_name}</span>
            </div>
            <div class="card-play-btn">▶</div>
          </div>
        </div>
        <div class="card-content">
          <div class="card-ep-label">Topic #${String(item.id).padStart(3, '0')}</div>
          <h3 class="card-title" style="font-size: 0.95rem;">${item.title}</h3>
          <div class="card-footer-link" style="margin-top: 10px;">
            <span>Watch Episode →</span>
          </div>
        </div>
      `;

      card.addEventListener("click", () => {
        window.location.href = `video.html?id=${item.id}&fromPage=${fromPage}`;
      });

      relatedGrid.appendChild(card);
    });
  }

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.style.transform = "translateX(-50%) translateY(0)";
    setTimeout(() => {
      toast.style.transform = "translateX(-50%) translateY(100px)";
    }, 2500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
