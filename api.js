const API_ENDPOINTS = {
    TERABOX: 'https://1024teradownloader.com/api/get-info?url=',
    TERABOX_FALLBACK: 'https://tera-core.vercel.app/api?url=',
    DISKWALA: 'https://thediskwala.com/api/diskwala?url='
};

const DOMAINS = {
    TERABOX: [
        'terabox.com',
        '1024terabox.com',
        'teraboxapp.com',
        'teraboxlink.com',
        'nephobox.com',
        '4funbox.com',
        'mirrobox.com',
        'momerybox.com'
    ],
    DISKWALA: [
        'diskwala.com',
        'diskwala.link'
    ]
};

/**
 * Identify the provider based on the URL
 * @param {string} url 
 * @returns {'TERABOX' | 'DISKWALA' | null}
 */
export function identifyProvider(url) {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();
        
        if (DOMAINS.TERABOX.some(d => hostname.includes(d))) return 'TERABOX';
        if (DOMAINS.DISKWALA.some(d => hostname.includes(d))) return 'DISKWALA';
        
        return null;
    } catch (e) {
        return null;
    }
}

/**
 * Extract download link from Terabox
 * @param {string} url 
 * @param {boolean} useFallback
 */
async function fetchTerabox(url, useFallback = false) {
    const apiBase = useFallback ? API_ENDPOINTS.TERABOX_FALLBACK : API_ENDPOINTS.TERABOX;
    const targetUrl = apiBase + encodeURIComponent(url);
    
    try {
        const response = await fetch(targetUrl);
        const data = await response.json();
        
        // Handle 1024teradownloader format (Primary)
        if (!useFallback && data.status === 'success' && data.list && data.list.length > 0) {
            const file = data.list[0];
            return {
                title: file.name || 'Terabox Video',
                size: file.size_formatted || 'Unknown',
                thumbnail: file.thumbnail || null,
                downloadUrl: file.normal_dlink,
                originalData: data
            };
        }

        // Handle tera-core format (Fallback)
        if (useFallback && data.status === 'success' && data.files && data.files.length > 0) {
            const file = data.files[0];
            let thumbnail = file.thumbnail;
            if (file.thumbnails && typeof file.thumbnails === 'object') {
                thumbnail = file.thumbnails['400'] || file.thumbnails['800'] || Object.values(file.thumbnails)[0];
            }

            return {
                title: file.filename || 'Terabox Video',
                size: file.size || 'Unknown',
                thumbnail: thumbnail || null,
                downloadUrl: file.download_link,
                originalData: data
            };
        }
        
        // If 31045 error or no files found, try fallback
        if ((data.error_code === 31045 || !data.list || data.list.length === 0) && !useFallback) {
            console.log('Primary API failed or session expired, trying fallback...');
            return await fetchTerabox(url, true);
        }

        throw new Error(data.message || data.error_msg || 'Failed to extract Terabox link. The file might be private or deleted.');
    } catch (error) {
        if (!useFallback) {
            return await fetchTerabox(url, true);
        }
        throw error;
    }
}

/**
 * Extract download link from Diskwala
 * @param {string} url 
 */
async function fetchDiskwala(url) {
    const response = await fetch(API_ENDPOINTS.DISKWALA + encodeURIComponent(url));
    const data = await response.json();
    
    if (data.status === 'success' || data.download_url) {
        return {
            title: data.filename || 'Diskwala Video',
            size: data.filesize || 'Unknown',
            thumbnail: null,
            downloadUrl: data.download_url,
            originalData: data
        };
    }
    throw new Error(data.message || 'Failed to extract Diskwala link');
}

/**
 * Main extraction function
 * @param {string} url 
 */
export async function extractLink(url) {
    const provider = identifyProvider(url);
    
    if (!provider) {
        throw new Error('Unsupported URL. Please provide a valid Terabox or Diskwala link.');
    }
    
    if (provider === 'TERABOX') return await fetchTerabox(url);
    if (provider === 'DISKWALA') return await fetchDiskwala(url);
}
