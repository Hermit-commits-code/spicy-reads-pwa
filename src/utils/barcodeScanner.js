// Utility for barcode scanning using QuaggaJS
// Loads QuaggaJS and provides a promise-based scanBarcode function

export function loadQuagga() {
  return new Promise((resolve, reject) => {
    if (window.Quagga) {
      resolve(window.Quagga);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/quagga@0.12.1/dist/quagga.min.js";
    script.onload = () => resolve(window.Quagga);
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export function scanBarcode(videoElement, onDetected) {
  return loadQuagga().then((Quagga) => {
    Quagga.init(
      {
        inputStream: {
          type: "LiveStream",
          target: videoElement,
          constraints: {
            facingMode: "environment",
          },
        },
        decoder: {
          readers: ["ean_reader", "ean_8_reader", "upc_reader", "upc_e_reader"],
        },
        locate: true,
      },
      (err) => {
        if (err) {
          console.error(err);
          return;
        }
        Quagga.start();
      }
    );
    Quagga.onDetected((result) => {
      if (result && result.codeResult && result.codeResult.code) {
        onDetected(result.codeResult.code);
        Quagga.stop();
      }
    });
  });
}

export function stopBarcodeScan() {
  if (window.Quagga) {
    window.Quagga.stop();
  }
}
