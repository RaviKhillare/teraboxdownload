import { extractLink } from './api.js?v=1.3';

document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const linkInput = document.getElementById('link-input');
    const submitBtn = document.getElementById('submit-btn');
    const statusEl = document.getElementById('status');
    const resultsContainer = document.getElementById('results-container');
    const fileTitle = document.getElementById('file-title');
    const fileSize = document.getElementById('file-size');
    const fileThumbnail = document.getElementById('file-thumbnail');
    const downloadBtn = document.getElementById('download-btn');

    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const url = linkInput.value.trim();
        
        if (!url) return;

        // Reset UI
        statusEl.innerHTML = `
            <div class="status-loading">
                <div class="loader"></div>
                <span>Extracting direct link...</span>
            </div>
        `;
        statusEl.style.display = 'block';
        resultsContainer.style.display = 'none';
        submitBtn.disabled = true;

        try {
            const result = await extractLink(url);
            
            // Update Results
            fileTitle.textContent = result.title;
            fileSize.textContent = `Size: ${result.size}`;
            
            if (result.thumbnail) {
                fileThumbnail.innerHTML = `<img src="${result.thumbnail}" alt="Thumbnail">`;
            } else {
                fileThumbnail.innerHTML = `<i data-lucide="video" size="32"></i>`;
                // Re-render icons since we added new ones
                if (window.lucide) window.lucide.createIcons();
            }
            
            downloadBtn.href = result.downloadUrl;
            
            // Show Success
            statusEl.style.display = 'none';
            resultsContainer.style.display = 'block';
            
        } catch (error) {
            statusEl.innerHTML = `<span style="color: var(--error)">Error: ${error.message}</span>`;
            statusEl.style.display = 'block';
        } finally {
            submitBtn.disabled = false;
        }
    });

    // Handle Paste from Clipboard on click (optional nice feature)
    linkInput.addEventListener('click', async () => {
        if (linkInput.value === '') {
            try {
                // Browsers might block this without permission
                // const text = await navigator.clipboard.readText();
                // if (text.includes('terabox') || text.includes('diskwala')) {
                //     linkInput.value = text;
                // }
            } catch (err) {
                // Ignore
            }
        }
    });
});
