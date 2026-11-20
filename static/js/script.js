let currentActiveGameTitle = "Geometry Dash";
        let favoriteGames = JSON.parse(localStorage.getItem('arcadeFlux_favorites')) || [];
        let currentFilter = 'all';
        
        const customGameSettings = {
            "99 nights (bloxd.io)": {
                slug: "99nights",
                image: "/assets/media/game-thumbnails/99nights.webp"
            }
        };

        // --- DOM ELEMENTS ---
        const gameIframe = document.getElementById('gameIframe');
        const playerLoader = document.getElementById('playerLoader');
        const playerError = document.getElementById('playerError');
        const playOverlay = document.getElementById('playOverlay');
        const playOverlayBg = document.getElementById('playOverlayBg');
        const playOverlayTitle = document.getElementById('playOverlayTitle');
        const playNowBtn = document.getElementById('playNowBtn');
        const playerGameTitle = document.getElementById('playerGameTitle');
        const playerGameCategory = document.getElementById('playerGameCategory');
        const infoTitle = document.getElementById('infoTitle');
        const infoDescription = document.getElementById('infoDescription');
        const infoTags = document.getElementById('infoTags');
        const favoriteToggleBtn = document.getElementById('favoriteToggleBtn');
        const favoriteBtnText = document.getElementById('favoriteBtnText');
        const favoritesCount = document.getElementById('favoritesCount');
        const favoritesDropdown = document.getElementById('favoritesDropdown');
        const favoritesDropdownList = document.getElementById('favoritesDropdownList');
        const favoritesHeaderBtn = document.getElementById('favoritesHeaderBtn');
        const relatedGamesGrid = document.getElementById('relatedGamesGrid');
        const sidebarRecommendations = document.getElementById('sidebarRecommendations');
        const categoriesGrid = document.getElementById('categoriesGrid');
        const themeToggleBtn = document.getElementById('themeToggleBtn');
        const themeIcon = document.getElementById('themeIcon');
        const fullscreenToggleBtn = document.getElementById('fullscreenToggleBtn');
        const gamePlayerWrapper = document.getElementById('gamePlayerWrapper');
        const headerDropdownMenu = document.getElementById('headerDropdownMenu');
        const footerCategoriesMenu = document.getElementById('footerCategoriesMenu');
        const gridSectionTitle = document.getElementById('gridSectionTitle');
        const gridActiveFilters = document.getElementById('gridActiveFilters');
        const errorRetryBtn = document.getElementById('errorRetryBtn');

        // Mobile drawer elements
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileOverlay = document.getElementById('mobileOverlay');
        const mobileNavDrawer = document.getElementById('mobileNavDrawer');
        const mobileNavClose = document.getElementById('mobileNavClose');

        // --- INITIALIZATION ---
        initApp();

        function initApp() {
            try {
                updateActiveNavMenu();
            } catch (e) {
                console.error("Nav menu active state sync error:", e);
            }

            try {
                // Initialize active game title from the DOM if present
                const gameTitleEl = document.getElementById('playerGameTitle');
                if (gameTitleEl && gameTitleEl.innerText.trim()) {
                    currentActiveGameTitle = gameTitleEl.innerText.trim();
                }
            } catch (e) {
                console.error("Game title initialization error:", e);
            }

            try {
                // Apply theme from localStorage if available
                const savedTheme = localStorage.getItem('arcadeFlux_theme') || 'light';
                if (savedTheme === 'dark' && themeIcon) {
                    document.body.classList.add('dark-mode');
                    themeIcon.innerHTML = '<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.32 11.32l.707-.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path>';
                }
            } catch (e) {
                console.error("Theme init error:", e);
            }

            try {
                // Bind Event Listeners
                bindEvents();
            } catch (e) {
                console.error("Event binding error:", e);
            }

            try {
                // Check if page pathname corresponds to a category subpage
                const path = window.location.pathname.replace(/^\/|\/$/g, '').toLowerCase();
                const validCategories = ['arcade', 'action', 'racing', 'puzzle', 'sports', 'adventure', 'shooting', 'strategy'];
                if (validCategories.includes(path)) {
                    const category = path.charAt(0).toUpperCase() + path.slice(1);
                    applyNavFilter(category);
                    
                    // Mark the corresponding category card active
                    document.querySelectorAll('#categoriesGrid .category-card').forEach(c => {
                        if (c.getAttribute('data-category').toLowerCase() === path) {
                            c.classList.add('active');
                        } else {
                            c.classList.remove('active');
                        }
                    });
                }
            } catch (e) {
                console.error("Path filtering error:", e);
            }
            
            try {
                // Sync Favorite UI Count and Populate Dropdown Menu
                updateFavoritesUI();
            } catch (e) {
                console.error("Favorites UI sync error:", e);
            }

            try {
                // Sync favorite button state for the default game
                syncFavoriteButtonState();
            } catch (e) {
                console.error("Favorite state sync error:", e);
            }
        }

        function updateActiveNavMenu() {
            try {
                const pathname = window.location.pathname;
                
                // Get all desktop and mobile navigation links
                const navLinks = document.querySelectorAll('.nav-menu .nav-link');
                const mobileLinks = document.querySelectorAll('.mobile-nav .mobile-link');
                
                // Helper to remove active class from all links
                const clearActive = () => {
                    navLinks.forEach(link => link.classList.remove('active'));
                    mobileLinks.forEach(link => link.classList.remove('active'));
                };
                
                // If we are in the /games/ directory, no menu should be showing active.
                if (pathname.includes('/games/')) {
                    clearActive();
                    return;
                }
                
                const normalizePath = (p) => {
                    if (!p) return '';
                    p = p.split('?')[0].split('#')[0].toLowerCase();
                    p = p.replace(/\/index\.(html|php)$/i, '/');
                    if (!p.startsWith('/')) p = '/' + p;
                    if (p !== '/' && !p.endsWith('/')) p = p + '/';
                    return p;
                };
                
                const currentNormalized = normalizePath(pathname);
                let foundMatch = false;
                
                const updateLinks = (links) => {
                    links.forEach(link => {
                        const href = link.getAttribute('href');
                        if (href) {
                            const linkNormalized = normalizePath(href);
                            if (linkNormalized === currentNormalized) {
                                link.classList.add('active');
                                foundMatch = true;
                            } else {
                                link.classList.remove('active');
                            }
                        }
                    });
                };
                
                updateLinks(navLinks);
                updateLinks(mobileLinks);
                
                // If we didn't find any match (e.g. on helper pages), clear active
                if (!foundMatch) {
                    clearActive();
                }
            } catch (e) {
                console.error("Error updating active navigation menu:", e);
            }
        }

        function syncFavoriteButtonState() {
            if (!currentActiveGameTitle || !favoriteToggleBtn) return;
            const isFav = favoriteGames.includes(currentActiveGameTitle.trim());
            if (isFav) {
                favoriteToggleBtn.classList.add('active-favorite');
                favoriteBtnText.innerText = 'Favorited';
            } else {
                favoriteToggleBtn.classList.remove('active-favorite');
                favoriteBtnText.innerText = 'Favorite';
            }
        }

        // --- EVENT BINDING ---
        function bindEvents() {
            // Dark Mode Toggle
            if (themeToggleBtn) {
                themeToggleBtn.addEventListener('click', toggleTheme);
            }

            // Fullscreen
            if (fullscreenToggleBtn) {
                fullscreenToggleBtn.addEventListener('click', toggleFullscreen);
                document.addEventListener('fullscreenchange', handleFullscreenChange);
                document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
            }

            // Favorites Toggle
            if (favoriteToggleBtn) {
                favoriteToggleBtn.addEventListener('click', toggleFavoriteCurrentGame);
            }

            // Favorites dropdown menu toggle
            if (favoritesHeaderBtn && favoritesDropdown) {
                favoritesHeaderBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    favoritesDropdown.classList.toggle('active');
                });
                document.addEventListener('click', () => {
                    favoritesDropdown.classList.remove('active');
                });
                favoritesDropdown.addEventListener('click', (e) => {
                    e.stopPropagation(); // don't close dropdown on clicking inside it
                });
            }

            // Play Now trigger
            if (playNowBtn) {
                playNowBtn.addEventListener('click', startPlayingGame);
            }

            // Iframe loading lifecycle
            if (gameIframe) {
                gameIframe.addEventListener('load', handleIframeLoaded);
            }
            if (errorRetryBtn) {
                errorRetryBtn.addEventListener('click', retryIframeLoad);
            }

            // Dynamic grid card click bindings (both main grid and sidebar!)
            document.querySelectorAll('.grid-card').forEach(card => {
                card.addEventListener('click', () => {
                    selectGameCard(card);
                });
            });

            // Mobile Menu Drawer triggers
            if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileMenu);
            if (mobileNavClose) mobileNavClose.addEventListener('click', closeMobileMenu);
            if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileMenu);

            // Clear active filter button
            if (gridActiveFilters) {
                gridActiveFilters.addEventListener('click', () => {
                    applyNavFilter('home');
                });
            }

            // Prevent arrow keys/spacebar from scrolling the page when the game is active, and reforce focus
            window.addEventListener('keydown', (e) => {
                const isGameActive = playOverlay && playOverlay.classList.contains('hidden') && 
                                     playerLoader && playerLoader.classList.contains('hidden') && 
                                     gameIframe && gameIframe.src && 
                                     gameIframe.src !== "about:blank";
                                     
                if (isGameActive) {
                    // Instantly focus both elements so keys are routed to the game
                    gameIframe.focus();
                    if (gameIframe.contentWindow) {
                        gameIframe.contentWindow.focus();
                    }
                    
                    const scrollingKeys = [32, 33, 34, 38, 40]; // Space, PageUp, PageDown, ArrowUp, ArrowDown
                    if (scrollingKeys.includes(e.keyCode)) {
                        e.preventDefault();
                    }
                }
            }, { passive: false });

            // Refocus iframe when clicking inside the player wrapper
            if (gamePlayerWrapper) {
                gamePlayerWrapper.addEventListener('click', (e) => {
                    const isGameActive = playOverlay && playOverlay.classList.contains('hidden') && 
                                         playerLoader && playerLoader.classList.contains('hidden') && 
                                         gameIframe && gameIframe.src && 
                                         gameIframe.src !== "about:blank";
                    if (isGameActive) {
                        gameIframe.focus();
                        if (gameIframe.contentWindow) {
                            gameIframe.contentWindow.focus();
                        }
                    }
                });
            }
        }

        // --- THEME MANAGEMENT ---
        function toggleTheme() {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('arcadeFlux_theme', isDark ? 'dark' : 'light');
            
            if (isDark) {
                themeIcon.innerHTML = '<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.32 11.32l.707-.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path>';
            } else {
                themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
            }
        }

        // --- FULLSCREEN LOGIC ---
        function toggleFullscreen() {
            if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                if (gamePlayerWrapper.requestFullscreen) {
                    gamePlayerWrapper.requestFullscreen();
                } else if (gamePlayerWrapper.webkitRequestFullscreen) {
                    gamePlayerWrapper.webkitRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            }
            // Refocus the game after a slight delay to allow fullscreen transitions to settle
            setTimeout(() => {
                gameIframe.focus();
                if (gameIframe.contentWindow) {
                    gameIframe.contentWindow.focus();
                }
            }, 200);
        }

        // Adjust aspect ratio structure on fullscreen shift
        function handleFullscreenChange() {
            const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
            if (isFull) {
                gamePlayerWrapper.classList.add('fullscreen-mode');
            } else {
                gamePlayerWrapper.classList.remove('fullscreen-mode');
            }
        }

        // --- GAME LAUNCHER / SELECTOR ---
        function selectGameCard(card) {
            const title = card.querySelector('.grid-card-title').innerText;
            const imgEl = card.querySelector('.thumbnail-img');
            const imgSrc = imgEl.getAttribute('data-src') || imgEl.getAttribute('src');
            
            loadGameByDetails(title, imgSrc);
        }

        function loadGameByDetails(title, imgSrc) {
            currentActiveGameTitle = title;
            
            // Derive category dynamically from the matching grid card
            const match = Array.from(document.querySelectorAll('.grid-card')).find(c => c.querySelector('.grid-card-title').innerText.trim() === title.trim());
            const category = match ? match.getAttribute('data-category') : 'Arcade';
            const desc = `Play ${title} unblocked online for free on ArcadeFlux. Run, jump, and navigate through challenging levels in this premium browser game experience!`;

            // Set up background blurred thumbnail for the play overlay (subtle 8px blur)
            playOverlayBg.style.backgroundImage = `url('${imgSrc}')`;

            // Reset player states
            gameIframe.src = "";
            playerLoader.classList.add('hidden');
            playerError.style.display = 'none';
            playOverlay.classList.remove('hidden');

            // Update Titles & Info
            playOverlayTitle.innerText = title;
            playerGameTitle.innerText = title;
            playerGameCategory.innerText = category;
            infoTitle.innerText = title;
            infoDescription.innerText = desc;

            // Populate Tags
            infoTags.innerHTML = '';
            const tags = [category, "Unblocked", "FreeToPlay", "WebGame"];
            tags.forEach(tag => {
                const tagEl = document.createElement('span');
                tagEl.className = 'game-tag';
                tagEl.innerText = tag;
                infoTags.appendChild(tagEl);
            });

            // Sync Favorite button state
            syncFavoriteButtonState();

            // Scroll player into view on small mobile viewports
            if (window.innerWidth <= 768) {
                gamePlayerWrapper.scrollIntoView({ behavior: 'smooth' });
            }
        }

        // Action when clicking the Play Now button
        function startPlayingGame() {
            playOverlay.classList.add('hidden');
            playerLoader.classList.remove('hidden');

            // Set iframe URL from target unblocked game data-src inside HTML
            const targetIframeUrl = gameIframe.getAttribute('data-src') || "";
            gameIframe.src = targetIframeUrl;

            // Focus both iframe element and content window after a slight delay to prevent focus-reset when playNowBtn is hidden
            setTimeout(() => {
                gameIframe.focus();
                if (gameIframe.contentWindow) {
                    gameIframe.contentWindow.focus();
                }
            }, 200);

            // Safety timeout for iframe load
            clearTimeout(window.iframeLoadTimeout);
            window.iframeLoadTimeout = setTimeout(() => {
                if (!playerLoader.classList.contains('hidden')) {
                    playerLoader.classList.add('hidden');
                    playerError.style.display = 'flex';
                }
            }, 8000);
        }

        // Safety iframe load listener
        function handleIframeLoaded() {
            if (gameIframe.src && gameIframe.src !== "about:blank") {
                clearTimeout(window.iframeLoadTimeout);
                playerLoader.classList.add('hidden');
                playerError.style.display = 'none';

                // Focus the iframe content window so keypresses are captured immediately on complete paint
                setTimeout(() => {
                    gameIframe.focus();
                    if (gameIframe.contentWindow) {
                        gameIframe.contentWindow.focus();
                    }
                }, 100);
            }
        }

        function retryIframeLoad() {
            startPlayingGame();
        }

        // --- FAVORITES MANAGEMENT ---
        function toggleFavoriteCurrentGame() {
            if (!currentActiveGameTitle) return;

            const index = favoriteGames.indexOf(currentActiveGameTitle);
            if (index > -1) {
                // Remove favorite
                favoriteGames.splice(index, 1);
                favoriteToggleBtn.classList.remove('active-favorite');
                favoriteBtnText.innerText = 'Favorite';
            } else {
                // Add favorite
                favoriteGames.push(currentActiveGameTitle);
                favoriteToggleBtn.classList.add('active-favorite');
                favoriteBtnText.innerText = 'Favorited';
            }

            localStorage.setItem('arcadeFlux_favorites', JSON.stringify(favoriteGames));
            updateFavoritesUI();
        }

        function updateFavoritesUI() {
            favoritesCount.innerText = favoriteGames.length;
            if (favoriteGames.length > 0) {
                favoritesCount.style.display = 'flex';
            } else {
                favoritesCount.style.display = 'none';
            }

            // Rebuild the header favorites dropdown menu list
            favoritesDropdownList.innerHTML = '';
            if (favoriteGames.length === 0) {
                favoritesDropdownList.innerHTML = '<div class="favorites-dropdown-empty">No favorite games yet.</div>';
                return;
            }

            favoriteGames.forEach(title => {
                const normalizedTitle = title.toLowerCase().trim();
                const customSettings = customGameSettings[normalizedTitle];

                const match = Array.from(document.querySelectorAll('.grid-card')).find(c => {
                    const titleEl = c.querySelector('.grid-card-title');
                    return titleEl && titleEl.innerText.trim() === title.trim();
                });
                const imgEl = match ? match.querySelector('.thumbnail-img') : null;
                
                let imgSrc;
                if (imgEl) {
                    imgSrc = imgEl.getAttribute('data-src') || imgEl.getAttribute('src');
                } else if (customSettings && customSettings.image) {
                    imgSrc = customSettings.image;
                } else {
                    imgSrc = `/assets/media/game-thumbnails/${normalizedTitle.replace(/[^a-z0-9]+/g, '-')}.webp`;
                }

                const item = document.createElement('div');
                item.className = 'favorites-dropdown-item';
                item.innerHTML = `
                    <img src="${imgSrc}" alt="${title}" class="favorites-dropdown-thumb">
                    <span class="favorites-dropdown-title">${title}</span>
                `;

                item.addEventListener('click', () => {
                    favoritesDropdown.classList.remove('active');
                    if (title.trim().toLowerCase() === currentActiveGameTitle.trim().toLowerCase()) {
                        return;
                    }
                    const slug = customSettings && customSettings.slug
                        ? customSettings.slug
                        : normalizedTitle.replace(/[^a-z0-9]+/g, '-');
                    window.location.href = `/games/${slug}/`;
                });

                favoritesDropdownList.appendChild(item);
            });
        }


        // --- MOBILE DRAWER NAVIGATION INTERACTION ---
        function openMobileMenu() {
            mobileNavDrawer.classList.add('active');
            mobileOverlay.classList.add('active');
        }

        function closeMobileMenu() {
            mobileNavDrawer.classList.remove('active');
            mobileOverlay.classList.remove('active');
        }