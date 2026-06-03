export default function BlobBackground() {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-40 h-40 sm:w-64 sm:h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl sm:blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-40 h-40 sm:w-64 sm:h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl sm:blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-40 h-40 sm:w-64 sm:h-64 bg-pink-600 rounded-full mix-blend-multiply filter blur-xl sm:blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
    );
  }