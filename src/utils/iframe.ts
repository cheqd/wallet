export async function loadUrlInIframe(url: string) {
    return new Promise<void>((resolve, _) => {
        const i = document.createElement('iframe');
        i.style.display = 'none';
        i.onload = function() {
            i.parentNode!.removeChild(i);
            resolve();
        };
        i.src = url;
        document.body.appendChild(i);
    })
}