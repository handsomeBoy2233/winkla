// =========================================================================
// VelvetVision HD - Player Page Script Engine
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    initPlayer();
});

async function initPlayer() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('id');

    let videos = (window.SCRAPED_VIDEOS_DATA && Array.isArray(window.SCRAPED_VIDEOS_DATA)) ? window.SCRAPED_VIDEOS_DATA : null;

    if (!videos || videos.length === 0) {
        try {
            const response = await fetch('scraped_videos.json');
            videos = await response.json();
        } catch (error) {
            console.error('Error loading video in player:', error);
            videos = window.SCRAPED_VIDEOS_DATA || [];
        }
    }

    if (videos && videos.length > 0) {
        let currentVideo = videos.find(v => v.id === videoId);
        if (!currentVideo && videos.length > 0) {
            currentVideo = videos[0]; // Fallback to first video
        }

        if (currentVideo) {
            renderPlayer(currentVideo);
            renderRelatedVideos(videos, currentVideo);
        }
    }
}

function renderPlayer(video) {
    const playerWrapper = document.getElementById('yy');
    const titleEl = document.getElementById('videoTitle');
    const viewsEl = document.getElementById('videoViews');
    const likesEl = document.getElementById('videoLikes');
    const durationEl = document.getElementById('videoDuration');
    const categoryEl = document.getElementById('videoCategory');

    if (titleEl) titleEl.textContent = video.title || 'Untitled Video';
    if (viewsEl) viewsEl.textContent = video.views || '200K';
    if (likesEl) likesEl.textContent = video.likes || '98%';
    if (durationEl) {
        if (video.duration && video.duration !== '15:30') {
            durationEl.textContent = video.duration;
            if (durationEl.parentElement) durationEl.parentElement.style.display = 'inline-flex';
        } else {
            if (durationEl.parentElement) durationEl.parentElement.style.display = 'none';
        }
    }
    if (categoryEl) {
        categoryEl.innerHTML = `<i class="fa-solid fa-tag"></i> ${video.categoryName || 'Asian'}`;
    }

    if (playerWrapper) {
        playerWrapper.innerHTML = '';
        const iframe = document.createElement('iframe');
        
        // 🎯 保证 BAS 识别：嵌入 iframe 添加 id="yy" 与 class="yy"
        iframe.id = 'yy';
        iframe.className = 'yy';
        iframe.src = video.embedUrl || `https://www.xnxx.com/embedframe/${video.id}`;
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', 'true');
        iframe.setAttribute('scrolling', 'no');
        iframe.style.width = '100%';
        iframe.style.height = '100%';

        playerWrapper.appendChild(iframe);
    }

    // Set page title
    document.title = `${video.title || 'Watch Video'} - NEXUS STREAM HD`;
}

function renderRelatedVideos(allVideos, currentVideo) {
    const relatedGrid = document.getElementById('relatedGrid');
    if (!relatedGrid) return;
    relatedGrid.innerHTML = '';

    // Pick 9 random videos excluding current video
    const candidates = allVideos.filter(v => v.id !== currentVideo.id);
    const shuffled = [...candidates].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 9);

    selected.forEach(video => {
        const card = document.createElement('a');
        card.href = `video.html?id=${video.id}`;
        card.style.textDecoration = 'none';

        // 🎯 保证 BAS 自动化脚本识别：注入 id="yy" 与 class="velvet-card yy"
        card.id = 'yy';
        card.className = 'velvet-card yy';

        const durationHtml = (video.duration && video.duration !== '15:30') ? `<span class="badge-duration"><i class="fa-regular fa-clock"></i> ${video.duration}</span>` : '';

        card.innerHTML = `
            <div class="card-thumb-box" style="background-image: url('${video.thumb}');">
                <span class="badge-hd">4K Ultra</span>
                ${durationHtml}
                <div class="play-overlay">
                    <div class="play-button-icon"><i class="fa-solid fa-play"></i></div>
                </div>
            </div>
            <div class="card-info-box">
                <h3 class="card-title-text" title="${video.title}">${video.title}</h3>
                <div class="card-meta-row">
                    <span class="card-cat-tag">${video.categoryName || 'Asian'}</span>
                    <div class="card-stats-item">
                        <span><i class="fa-regular fa-eye"></i> ${video.views || '200K'}</span>
                        <span class="stat-like"><i class="fa-solid fa-thumbs-up"></i> ${video.likes || '98%'}</span>
                    </div>
                </div>
            </div>
        `;

        relatedGrid.appendChild(card);
    });
}
