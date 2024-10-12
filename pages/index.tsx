import Head from 'next/head';
import Image from 'next/image';
import { useState } from 'react';
import { createQR } from '@solana/pay';

export default function Home() {
  const [qrCode, setQrCode] = useState<string | undefined>(undefined);
  const [reference, setReference] = useState<string | undefined>(undefined);

  const handleGenerateClick = async () => {
    try {
      // 1 - Send a POST request to our backend and log the response URL
      const res = await fetch('/api/pay', { method: 'POST' });
      const { url, ref } = await res.json();
      console.log(url);

      // 2 - Generate a QR Code from the URL and generate a blob
      const qr = createQR(url);
      const qrBlob = await qr.getRawData('png');
      if (!qrBlob) return;

      // 3 - Convert the blob to a base64 string (using FileReader) and set the QR code state
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setQrCode(event.target.result);  // Store base64 string in qrCode state
        }
      };
      reader.readAsDataURL(qrBlob); // Convert Blob to base64

      // 4 - Set the reference state
      setReference(ref);
    } catch (error) {
      console.error('Error generating payment:', error);
    }
  };

  const handleVerifyClick = async () => {
    if (!reference) {
      alert('Please generate a payment order first');
      return;
    }
    try {
      // 1 - Send a GET request to our backend and return the response status
      const res = await fetch(`/api/pay?reference=${reference}`);
      const { status } = await res.json();

      // 2 - Alert the user if the transaction was verified or not and reset the QR code and reference
      if (status === 'verified') {
        alert('Transaction verified');
        setQrCode(undefined);
        setReference(undefined);
      } else {
        alert('Transaction not found');
      }
    } catch (error) {
      console.error('Error verifying transaction:', error);
    }
  };

  return (
    <>
      <Head>
        <title>Solana Pay Demo</title>
        <meta name="description" content="Solana Pay Integration Demo" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
          <h1 className='text-2xl font-semibold'>Solana Pay Demo</h1>
        </div>
        {qrCode && (
          <Image
            src={qrCode}
            style={{ position: "relative", background: "white" }}
            alt="QR Code"
            width={200}
            height={200}
            priority
            unoptimized={true} // Use unoptimized for base64 or dynamic images
          />
        )}
        <div className="mt-4">
          <button
            style={{ cursor: 'pointer', padding: '10px', marginRight: '10px' }}
            onClick={handleGenerateClick}
          >
            Generate QR Code
          </button>
          {reference && (
            <button
              style={{ cursor: 'pointer', padding: '10px' }}
              onClick={handleVerifyClick}
            >
              Verify Transaction
            </button>
          )}
        </div>
      </main>
    </>
  );
}
