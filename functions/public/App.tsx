
import React, { useState, useCallback, useMemo } from 'react';
import { extractGridFromImage } from './services/geminiService.ts';
import { UploadIcon } from './components/icons/UploadIcon.tsx';
import { CopyIcon } from './components/icons/CopyIcon.tsx';
import { ShareIcon } from './components/icons/ShareIcon.tsx';
import { SpinnerIcon } from './components/icons/SpinnerIcon.tsx';
import { CheckIcon } from './components/icons/CheckIcon.tsx';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const imageUrl = useMemo(() => {
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    }
    return null;
  }, [imageFile]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleExtraction = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setExtractedText(null);

    try {
      const base64Image = await fileToBase64(file);
      const result = await extractGridFromImage(base64Image, file.type);
      setExtractedText(result);
    } catch (err) {
      console.error(err);
      setError('Failed to extract text. Please try another image.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      handleExtraction(file);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setExtractedText(null);
    setError(null);
    setIsLoading(false);
    setCopySuccess(false);
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
  };

  const handleShare = async () => {
    if (navigator.share && extractedText) {
      try {
        await navigator.share({
          title: 'Country Grid',
          text: extractedText,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      alert('Share functionality is not supported on this browser.');
    }
  };

  const handleCopy = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            GGG Extractor AI
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Upload a 3x3 country grid screenshot from <a target="_blank" rel="noopener noreferrer" href="https://geogridgame.com">GGG</a> and let AI do the rest.
          </p>
        </header>

        <main className="bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 transition-all duration-300">
          {!imageFile ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-xl p-12 text-center hover:border-indigo-500 transition-colors duration-300">
              <UploadIcon className="w-16 h-16 text-gray-500 mb-4" />
              <label htmlFor="file-upload" className="cursor-pointer bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500">
                Upload Screenshot
              </label>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
              <p className="mt-4 text-sm text-gray-400">PNG, JPG, GIF up to 10MB</p>
            </div>
          ) : (
            <div>
              <div className="mb-6 relative">
                <img src={imageUrl!} alt="Uploaded screenshot" className="rounded-lg shadow-md w-full h-auto object-contain max-h-96" />
              </div>

              {isLoading && (
                <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-700/50 rounded-lg">
                  <SpinnerIcon className="w-12 h-12 text-indigo-400" />
                  <p className="mt-4 text-lg font-semibold animate-pulse">Analyzing your grid...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
                  <p className="font-bold">An error occurred</p>
                  <p>{error}</p>
                </div>
              )}

              {extractedText && (
                <div className="space-y-6">
                    <div className="bg-gray-900 rounded-lg p-4">
                        <h2 className="text-lg font-semibold text-gray-300 mb-2">Extracted Grid:</h2>
                        <pre className="text-left text-sm sm:text-base whitespace-pre-wrap font-mono bg-gray-800 p-4 rounded-md overflow-x-auto">{extractedText}</pre>
                    </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    {navigator.share && (
                      <button onClick={handleShare} className="flex-1 inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300">
                        <ShareIcon className="w-5 h-5" />
                        <span>Share</span>
                      </button>
                    )}
                    <button onClick={handleCopy} className={`flex-1 inline-flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-lg transition-colors duration-300 ${copySuccess ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-600 hover:bg-gray-500 text-white'}`}>
                      {copySuccess ? <CheckIcon className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
                      <span>{copySuccess ? 'Copied!' : 'Copy to Clipboard'}</span>
                    </button>
                  </div>
                </div>
              )}
              
              <div className="mt-8 text-center">
                  <button onClick={handleReset} className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors duration-300">
                    Upload another image
                  </button>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;