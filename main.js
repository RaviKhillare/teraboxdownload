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
                fileThumbnail.innerHTML = `<div class="icon-placeholder"><i data-lucide="video"></i></div>`;
            }
            
            downloadBtn.href = result.downloadUrl;
            
            // Show Success
            statusEl.style.display = 'none';
            resultsContainer.style.display = 'block';
            
            // Re-render icons if needed
            if (window.lucide) window.lucide.createIcons();
            
        } catch (error) {
            statusEl.innerHTML = `
                <div class="status-error">
                    <i data-lucide="alert-circle"></i>
                    <span>${error.message}</span>
                </div>
            `;
            statusEl.style.display = 'block';
            if (window.lucide) window.lucide.createIcons();
        } finally {
            submitBtn.disabled = false;
        }
    });

    // Paste from Clipboard functionality
    const pasteBtn = document.getElementById('paste-btn');
    if (pasteBtn) {
        pasteBtn.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (text) {
                    linkInput.value = text;
                    linkInput.focus();
                }
            } catch (err) {
                console.error('Failed to read clipboard:', err);
            }
        });
    }

    // Clear input functionality
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            linkInput.value = '';
            linkInput.focus();
            resultsContainer.style.display = 'none';
            statusEl.style.display = 'none';
        });
    }
});
