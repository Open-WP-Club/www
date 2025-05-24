// Load and display plugins from CSV in a slider format
async function loadPlugins() {
  const loadingEl = document.getElementById('plugins-loading');
  const errorEl = document.getElementById('plugins-error');
  const sliderContainer = document.getElementById('plugins-slider-container');
  const sliderEl = document.getElementById('plugins-slider');
  
  try {
    // Fetch CSV from GitHub
    const response = await fetch('https://raw.githubusercontent.com/Open-WP-Club/.github/main/plugins.csv');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const csvText = await response.text();
    const plugins = parseCSV(csvText);
    
    if (plugins.length === 0) {
      throw new Error('No plugins found');
    }
    
    // Hide loading, show slider
    loadingEl.classList.add('hidden');
    sliderContainer.classList.remove('hidden');
    
    // Create plugin cards for slider
    sliderEl.innerHTML = '';
    plugins.forEach(function(plugin) {
      const card = document.createElement('div');
      card.className = 'flex-none w-64 bg-gradient-to-br from-blue-50 via-white to-blue-50 rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-200 border border-blue-100';
      
      card.innerHTML = `
        <div class="flex items-center space-x-2 mb-3">
          <div class="flex-shrink-0">
            <svg class="size-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 truncate">${escapeHtml(plugin.name)}</h3>
        </div>
        <p class="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">${escapeHtml(plugin.description)}</p>
        
        ${plugin.version || plugin.downloads || plugin.rating ? `
        <div class="flex flex-wrap gap-1 mb-4">
          ${plugin.version ? `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">v${escapeHtml(plugin.version)}</span>` : ''}
          ${plugin.downloads ? `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">${formatNumber(plugin.downloads)}</span>` : ''}
          ${plugin.rating ? `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">★ ${plugin.rating}</span>` : ''}
        </div>
        ` : ''}
        
        <div class="flex gap-2">
          <a href="${plugin.github_url || `https://github.com/Open-WP-Club/${plugin.slug || plugin.name.replace(/\s+/g, '-')}`}" target="_blank" rel="noopener noreferrer" 
             class="inline-flex items-center px-3 py-1.5 border border-blue-600 text-xs font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-colors duration-200 flex-1 justify-center">
            <svg class="size-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd"></path>
            </svg>
            GitHub
          </a>
          ${plugin.wordpress_url ? `
          <a href="${escapeHtml(plugin.wordpress_url)}" target="_blank" rel="noopener noreferrer" 
             class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 flex-1 justify-center">
            <svg class="size-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0z"/>
            </svg>
            WP
          </a>
          ` : ''}
        </div>
      `;
      
      sliderEl.appendChild(card);
    });
    
    // Initialize slider functionality
    initializeSlider(plugins.length);
    
  } catch (error) {
    console.error('Error loading plugins:', error);
    loadingEl.classList.add('hidden');
    errorEl.classList.remove('hidden');
  }
}

// Initialize slider with navigation controls
function initializeSlider(totalPlugins) {
  const slider = document.getElementById('plugins-slider');
  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');
  
  if (!slider || !prevBtn || !nextBtn) return;
  
  let currentIndex = 0;
  
  // Calculate card width dynamically based on actual rendered size
  function getCardWidth() {
    const firstCard = slider.querySelector('.flex-none');
    if (firstCard) {
      const cardRect = firstCard.getBoundingClientRect();
      const gap = 16; // gap-4 = 1rem = 16px
      return cardRect.width + gap;
    }
    return 272; // fallback: 256px + 16px gap
  }
  
  // Calculate how many plugins to show based on screen size
  function getVisibleCount() {
    const containerWidth = slider.parentElement.offsetWidth;
    if (containerWidth >= 1280) return Math.min(6, totalPlugins); // xl: show 6
    if (containerWidth >= 1024) return Math.min(4, totalPlugins);  // lg: show 4
    if (containerWidth >= 768) return Math.min(3, totalPlugins);   // md: show 3
    if (containerWidth >= 640) return Math.min(2, totalPlugins);   // sm: show 2
    return 1; // xs: show 1
  }
  
  function updateSlider() {
    const visibleCount = getVisibleCount();
    const maxIndex = Math.max(0, totalPlugins - visibleCount);
    const cardWidth = getCardWidth();
    
    // Ensure currentIndex is within bounds
    currentIndex = Math.min(currentIndex, maxIndex);
    currentIndex = Math.max(currentIndex, 0);
    
    // Update slider position
    const translateX = -(currentIndex * cardWidth);
    slider.style.transform = `translateX(${translateX}px)`;
    
    // Update button states
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex;
    
    // Update button opacity based on disabled state
    prevBtn.classList.toggle('opacity-50', prevBtn.disabled);
    nextBtn.classList.toggle('opacity-50', nextBtn.disabled);
  }
  
  function slideNext() {
    const visibleCount = getVisibleCount();
    const maxIndex = Math.max(0, totalPlugins - visibleCount);
    if (currentIndex < maxIndex) {
      currentIndex = Math.min(currentIndex + 1, maxIndex);
      updateSlider();
    }
  }
  
  function slidePrev() {
    if (currentIndex > 0) {
      currentIndex = Math.max(0, currentIndex - 1);
      updateSlider();
    }
  }
  
  // Event listeners
  nextBtn.addEventListener('click', slideNext);
  prevBtn.addEventListener('click', slidePrev);
  
  // Handle window resize
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateSlider, 150);
  });
  
  // Initialize slider position
  updateSlider();
  
  // Auto-slide every 8 seconds (optional)
  setInterval(function() {
    const visibleCount = getVisibleCount();
    const maxIndex = Math.max(0, totalPlugins - visibleCount);
    
    if (currentIndex >= maxIndex) {
      currentIndex = 0;
    } else {
      slideNext();
      return;
    }
    updateSlider();
  }, 8000);
}

// Parse CSV with proper handling
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  
  // Parse headers
  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim().toLowerCase());
  const plugins = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 2) continue;
    
    const plugin = {};
    headers.forEach((header, index) => {
      plugin[header] = values[index] || '';
    });
    
    // Normalize field names and ensure we have required data
    const name = plugin.name || plugin.plugin_name || plugin.title || values[0];
    const description = plugin.description || plugin.desc || plugin.short_description || values[1];
    
    if (name && name.trim()) {
      plugins.push({
        name: name.trim(),
        description: description ? description.trim() : 'WordPress plugin by Open WP Club',
        version: plugin.version || plugin.ver || '',
        downloads: plugin.downloads || plugin.download_count || '',
        rating: plugin.rating || plugin.stars || '',
        github_url: plugin.github_url || plugin.github || plugin.repo_url || '',
        wordpress_url: plugin.wordpress_url || plugin.wp_url || plugin.plugin_url || '',
        slug: plugin.slug || plugin.plugin_slug || ''
      });
    }
  }
  
  return plugins;
}

// Parse CSV line with quote handling
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result.map(val => val.replace(/^"|"$/g, ''));
}

// Utility functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatNumber(num) {
  const n = parseInt(num);
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

// Load plugins when page loads
document.addEventListener('DOMContentLoaded', loadPlugins);

function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  mobileMenu.classList.toggle('hidden');
}