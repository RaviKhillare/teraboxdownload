const API_ENDPOINTS = {
    TERABOX: 'https://terabox-dl-arman.vercel.app/api?data=',
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
 */
async function fetchTerabox(url) {
    const response = await fetch(API_ENDPOINTS.TERABOX + encodeURIComponent(url));
    const data = await response.json();
    
    if (data.status === 'success' && data.data) {
        // The API returns an array or object usually
        const file = Array.isArray(data.data) ? data.data[0] : data.data;
        return {
            title: file.filename || 'Terabox Video',
            size: file.size || 'Unknown',
            thumbnail: file.thumb || null,
            downloadUrl: file.download_link || file.dlink,
            originalData: data
        };
    }
    throw new Error(data.message || 'Failed to extract Terabox link');
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
