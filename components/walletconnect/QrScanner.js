
import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion } from 'framer-motion';

const QrScanner = ({ onScanSuccess, onScanError }) => {
    const scannerRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        // Initialize the scanner only once
        if (!scannerRef.current) {
            scannerRef.current = new Html5Qrcode('qr-reader-container');
        }

        const cleanup = () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(err => {
                    console.error("Failed to stop the scanner cleanly.", err);
                });
            }
        };

        if (isScanning) {
            scannerRef.current.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText, decodedResult) => {
                    onScanSuccess(decodedText);
                    setIsScanning(false); // Stop scanning on success
                },
                (errorMessage) => {
                    // This callback is called for non-critical errors, like QR not found.
                    // It can be ignored to allow continuous scanning.
                }
            ).catch(err => {
                onScanError(err.message || "Could not start the scanner.");
                setIsScanning(false);
            });
        } else {
            cleanup();
        }

        // Cleanup on component unmount
        return () => cleanup();
    }, [isScanning, onScanSuccess, onScanError]);

    return (
        <div className="text-center">
            <div id="qr-reader-container" className={`w-full max-w-sm mx-auto rounded-lg overflow-hidden transition-all duration-300 ${isScanning ? 'h-auto' : 'h-0'}`}></div>

            <motion.button
                onClick={() => setIsScanning(!isScanning)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl text-lg mt-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
            >
                {isScanning ? 'Cancel' : 'Scan QR Code'}
            </motion.button>
        </div>
    );
};

export default QrScanner;
