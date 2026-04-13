import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { UploadScreen } from '@/components/UploadScreen';
import { Dashboard } from '@/components/Dashboard';
import type { UploadedFiles } from '@/types/geo';

const Index = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles | null>(null);

  const handleFilesUploaded = (files: UploadedFiles) => {
    setUploadedFiles(files);
  };

  const handleBack = () => {
    setUploadedFiles(null);
  };

  return (
    <div className="relative min-h-screen">
      {/* Dynamic Aurora Background */}
      <div className="bg-aurora">
        <div className="aurora-blob w-[500px] h-[500px] bg-primary/20 -top-48 -left-48" />
        <div className="aurora-blob w-[400px] h-[400px] bg-secondary/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="aurora-blob w-[600px] h-[600px] bg-accent/10 -bottom-48 -right-48" />
      </div>

      <AnimatePresence mode="wait">
        {!uploadedFiles?.before || !uploadedFiles?.after ? (
          <UploadScreen key="upload" onFilesUploaded={handleFilesUploaded} />
        ) : (
          <Dashboard
            key="dashboard"
            before={uploadedFiles.before}
            after={uploadedFiles.after}
            onBack={handleBack}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
