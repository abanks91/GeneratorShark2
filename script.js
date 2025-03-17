
// ===============================
// ✅ Pexels API Configuration (Only Pexels Used)
// ===============================
const PEXELS_API_KEY = "SPt90w4tCs0vgIvnBK8xTjQL3LZN7rWmkD5Tno3fc9nlvxXcvDhEdS8H"; // Replace with your actual Pexels API Key

// Cache for storing API responses
const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Load User Preferences (Last Active Tab & Search History)
document.addEventListener("DOMContentLoaded", function () {
    const lastTab = localStorage.getItem("lastActiveTab") || "images";
    const lastSearch = localStorage.getItem("lastSearch") || "";
    document.getElementById("searchQuery").value = lastSearch;
    switchTab(lastTab);
});

async function fetchGallery() {
    let query = document.getElementById("searchQuery").value || "nature"; // Default search query
    let galleryDiv = document.getElementById("gallery");
    let aiRecDiv = document.getElementById("aiRecommendations");

    // Save user search history
    localStorage.setItem("lastSearch", query);

    galleryDiv.innerHTML = "<p>Loading...</p>";

    try {
        // Fetch AI Recommendations from backend (proxy)
        let aiRecommendations = await getAIRecommendations(query);
        aiRecDiv.innerHTML = "🔍 Try these: " + aiRecommendations.join(", ");

        // Check cache for Pexels data
        const cacheKey = `pexels_${query}`;
        const cachedData = getFromCache(cacheKey);

        let imageData, videoData;

        if (cachedData) {
            console.log("Using cached data for:", query);
            imageData = cachedData.imageData;
            videoData = cachedData.videoData;
        } else {
            // Fetch images from Pexels
            let imageRes = await fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=10`, {
                headers: { Authorization: PEXELS_API_KEY }
            });
            imageData = await imageRes.json();

            // Fetch videos from Pexels
            let videoRes = await fetch(`https://api.pexels.com/videos/search?query=${query}&per_page=5`, {
                headers: { Authorization: PEXELS_API_KEY }
            });
            videoData = await videoRes.json();

            // Store in cache
            addToCache(cacheKey, { imageData, videoData });
        }

        galleryDiv.innerHTML = ""; // Clear loading message

        // Display Pexels Images
        imageData.photos.forEach(photo => {
            let imgElement = document.createElement("img");
            imgElement.src = photo.src.medium;
            imgElement.alt = photo.photographer;
            imgElement.loading = "lazy"; // ✅ Lazy Loading
            imgElement.style.width = "200px";
            imgElement.style.borderRadius = "5px";
            imgElement.style.cursor = "pointer";
            imgElement.onclick = () => selectMedia(photo.src.original, "image");
            galleryDiv.appendChild(imgElement);
        });

        // Display Pexels Videos
        videoData.videos.forEach(video => {
            let videoElement = document.createElement("video");
            videoElement.src = video.video_files[0].link;
            videoElement.controls = true;
            videoElement.style.width = "200px";
            videoElement.style.borderRadius = "5px";
            videoElement.onclick = () => selectMedia(video.video_files[0].link, "video");
            galleryDiv.appendChild(videoElement);
        });

        // ✅ Track Popular Searches (Analytics Simulation)
        trackSearch(query);

    } catch (error) {
        galleryDiv.innerHTML = "<p>Error loading gallery. Please try again.</p>";
        console.error("Gallery Fetch Error:", error);
    }
}

// ✅ AI-Powered Search Recommendations (Fetch from Backend Proxy)
async function getAIRecommendations(query) {
    let response = await fetch("/api/ai-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
    });

    let data = await response.json();
    return data.terms || [];
}

// ✅ Allow Users to Select an Image/Video for Editing
function selectMedia(url, type) {
    let selectedImage = document.getElementById("selectedImage");
    let selectedVideo = document.getElementById("selectedVideo");
    let useInEditor = document.getElementById("useInEditor");

    if (type === "image") {
        selectedImage.src = url;
        selectedImage.style.display = "block";
        selectedVideo.style.display = "none";
    } else if (type === "video") {
        selectedVideo.src = url;
        selectedVideo.style.display = "block";
        selectedImage.style.display = "none";
    }

    useInEditor.style.display = "block";
    useInEditor.setAttribute("data-url", url);
    useInEditor.setAttribute("data-type", type);
}

// ✅ Send Selected Media to the Editor
function sendToEditor() {
    let useInEditor = document.getElementById("useInEditor");
    let selectedUrl = useInEditor.getAttribute("data-url");
    let selectedType = useInEditor.getAttribute("data-type");

    window.location.href = `editor.html?type=${selectedType}&url=${encodeURIComponent(selectedUrl)}`;
}

// ✅ Track Popular Search Terms (Simple Analytics Simulation)
function trackSearch(query) {
    let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || {};
    searchHistory[query] = (searchHistory[query] || 0) + 1;
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    console.log("Search Analytics Updated:", searchHistory);
}

// ✅ Cache Management Functions
function addToCache(key, data) {
    apiCache.set(key, {
        data: data,
        timestamp: Date.now()
    });
}

function getFromCache(key) {
    const cachedItem = apiCache.get(key);
    if (!cachedItem) return null;

    const isExpired = (Date.now() - cachedItem.timestamp) > CACHE_DURATION;
    if (isExpired) {
        apiCache.delete(key);
        return null;
    }

    return cachedItem.data;
}

// ✅ Tab Navigation (Store Last Active Tab)
function switchTab(tab) {
    localStorage.setItem("lastActiveTab", tab);
    console.log("Switched to tab:", tab);
}

// ✅ Screen Reader Announcements for Accessibility
function announceToScreenReader(message) {
    let announcer = document.getElementById('sr-announcer');

    if (!announcer) {
        announcer = document.createElement('div');
        announcer.id = 'sr-announcer';
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        document.body.appendChild(announcer);
    }

    announcer.textContent = message;
}

// ✅ Initialize Screen Reader Announcer on Page Load
document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('sr-announcer')) {
        const announcer = document.createElement('div');
        announcer.id = 'sr-announcer';
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        document.body.appendChild(announcer);
    }
});
