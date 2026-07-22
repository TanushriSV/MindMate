const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'MindMate-main', 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(srcDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    if (content.includes('fetch("/api/') || content.includes('fetch(`/api/')) {
        // Add import if not present
        if (!content.includes('API_BASE_URL')) {
            // Find first line after imports or just put at top
            content = `import { API_BASE_URL } from '@/apiConfig';\n` + content;
        }
        
        // Replace fetch calls
        content = content.replace(/fetch\("(\/api\/[^"]*)"/g, 'fetch(API_BASE_URL + "$1"');
        content = content.replace(/fetch\(`(\/api\/[^`]*)`/g, 'fetch(API_BASE_URL + `$1`');
    }
    
    // Also handle fetch('/api/auth/refresh') in UserContext
    if (content.includes("fetch('/api/")) {
        if (!content.includes('API_BASE_URL')) {
            content = `import { API_BASE_URL } from '@/apiConfig';\n` + content;
        }
        content = content.replace(/fetch\('(\/api\/[^']*)'/g, "fetch(API_BASE_URL + '$1'");
    }

    if (content !== original) {
        // Add try-catch if the user wants network error logging
        // Since it's complex to wrap existing fetches with try-catch reliably via regex,
        // we will just do the URL replacement and let the existing logic handle it,
        // or we can add a global fetch interceptor.
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
    }
});
