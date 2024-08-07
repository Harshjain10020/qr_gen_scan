document.addEventListener('DOMContentLoaded', () => {
    const generatorBtn = document.getElementById('generatorBtn');
    const scannerBtn = document.getElementById('scannerBtn');
    const generator = document.getElementById('generator');
    const scanner = document.getElementById('scanner');
    const generateBtn = document.getElementById('generateBtn');
    const scanBtn = document.getElementById('scanBtn');
    const downloadGeneratorDataBtn = document.getElementById('downloadGeneratorDataBtn');
    const downloadScannerDataBtn = document.getElementById('downloadScannerDataBtn');
    const qrcodeContainer = document.getElementById('qrcode');
    const text = document.getElementById('text');
    const video = document.getElementById('video');
    const result = document.getElementById('result');
    let qrDataList = [];
    let scannedDataList = [];

    generatorBtn.addEventListener('click', () => {
        generator.classList.remove('hidden');
        scanner.classList.add('hidden');
    });

    scannerBtn.addEventListener('click', () => {
        scanner.classList.remove('hidden');
        generator.classList.add('hidden');
    });

    generateBtn.addEventListener('click', () => {
        qrcodeContainer.innerHTML = '';
        const qrText = text.value;
        if (qrText) {
            new QRCode(qrcodeContainer, {
                text: qrText,
                width: 128,
                height: 128,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
            qrDataList.push(qrText);
        }
    });

    downloadGeneratorDataBtn.addEventListener('click', () => {
        if (qrDataList.length > 0) {
            const worksheet = XLSX.utils.aoa_to_sheet([['QR Data'], ...qrDataList.map(data => [data])]);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "QR Data");
            XLSX.writeFile(workbook, 'Generated_QR_Data.xlsx');
        }
    });

    scanBtn.addEventListener('click', async () => {
        result.innerHTML = '';
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = stream;
        video.setAttribute('playsinline', true); // required to tell iOS safari we don't want fullscreen
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
                if (!scannedDataList.includes(code.data)) {
                    scannedDataList.push(code.data);
                }
            }
        }
        requestAnimationFrame(tick);
    }

    downloadScannerDataBtn.addEventListener('click', () => {
        if (scannedDataList.length > 0) {
            const worksheet = XLSX.utils.aoa_to_sheet([['Scanned QR Data'], ...scannedDataList.map(data => [data])]);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Scanned QR Data");
            XLSX.writeFile(workbook, 'Scanned_QR_Data.xlsx');
        }
    });
});
