document.addEventListener('DOMContentLoaded', () => {
    const generatorBtn = document.getElementById('generatorBtn');
    const scannerBtn = document.getElementById('scannerBtn');
    const generator = document.getElementById('generator');
    const scanner = document.getElementById('scanner');
    const generateBtn = document.getElementById('generateBtn');
    const scanBtn = document.getElementById('scanBtn');
    const qrcode = document.getElementById('qrcode');
    const text = document.getElementById('text');
    const video = document.getElementById('video');
    const result = document.getElementById('result');

    generatorBtn.addEventListener('click', () => {
        generator.classList.remove('hidden');
        scanner.classList.add('hidden');
    });

    scannerBtn.addEventListener('click', () => {
        scanner.classList.remove('hidden');
        generator.classList.add('hidden');
    });

    generateBtn.addEventListener('click', () => {
        qrcode.innerHTML = '';
        const qrText = text.value;
        if (qrText) {
            new QRCode(qrcode, qrText);
        }
    });

    scanBtn.addEventListener('click', async () => {
        result.innerHTML = '';
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = stream;
        video.setAttribute('playsinline', true);
        video.play();
        requestAnimationFrame(tick);
    });

    function tick() {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code) {
                result.innerHTML = `QR Code Data: ${code.data}`;
                video.pause();
                video.srcObject.getTracks().forEach(track => track.stop());
            }
        }
        requestAnimationFrame(tick);
    }
});
