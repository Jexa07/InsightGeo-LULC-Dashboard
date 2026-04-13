import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileJson, CheckCircle2, MapPin, ArrowRight, AlertCircle } from 'lucide-react';
import type { GeoJSONData, UploadedFiles } from '@/types/geo';

interface UploadScreenProps {
  onFilesUploaded: (files: UploadedFiles) => void;
}

interface DropZoneProps {
  label: string;
  sublabel: string;
  file: GeoJSONData | null;
  fileName: string | null;
  onFileSelect: (data: GeoJSONData, name: string) => void;
  icon: 'before' | 'after';
}

function DropZone({ label, sublabel, file, fileName, onFileSelect, icon }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const processFile = useCallback((fileObj: File) => {
    setError(null);

    if (!fileObj.name.endsWith('.geojson') && !fileObj.name.endsWith('.json')) {
      setError('Please upload a GeoJSON file (.geojson or .json)');
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as GeoJSONData;

        if (data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
          setError('Invalid GeoJSON: Must be a FeatureCollection');
          return;
        }

        onFileSelect(data, fileObj.name);
      } catch {
        setError('Failed to parse GeoJSON file');
      }
    };

    reader.onerror = () => {
      setError('Failed to read file');
    };

    reader.readAsText(fileObj);
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files?.[0]) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.[0]) {
      processFile(files[0]);
    }
  }, [processFile]);

  const isUploaded = file !== null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1"
    >
      <label
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center cursor-pointer
          min-h-[300px] glass-card transition-all duration-500 group overflow-visible
          ${isDragging ? 'ring-2 ring-primary bg-primary/5' : 'ring-1 ring-white/10'}
          ${isUploaded ? 'ring-1 ring-primary/40 bg-primary/[0.02]' : ''}
        `}
      >
        {/* Glow Aura */}
        <div className={`
          absolute -inset-1 rounded-3xl blur-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-700
          ${icon === 'before' ? 'bg-primary' : 'bg-secondary'}
          ${isUploaded ? 'opacity-5' : ''}
        `} />

        <input
          type="file"
          accept=".geojson,.json"
          onChange={handleFileInput}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {isUploaded ? (
            <motion.div
              key="uploaded"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center text-center p-8"
            >
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 ring-1 ring-primary/20 shadow-2xl">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <span className="text-xl font-extrabold text-white mb-2 tracking-tight italic uppercase italic">
                {label} <span className="text-primary not-italic">LOCKED</span>
              </span>
              <div className="flex items-center gap-3 px-5 py-2.5 bg-black/40 border border-white/10 rounded-2xl mb-4">
                <FileJson className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono text-muted-foreground truncate max-w-[180px]">{fileName}</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-white/5 px-3 py-1 rounded-full">
                {file.features.length} Nodes Indexed
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center text-center p-8"
            >
              <div className={`
                w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6 transition-all duration-500
                group-hover:rotate-12 group-hover:scale-110
                ${icon === 'before'
                  ? 'bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/30'
                  : 'bg-gradient-to-br from-secondary/20 to-secondary/5 ring-1 ring-secondary/30'
                }
              `}>
                {icon === 'before' ? (
                  <MapPin className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]" />
                ) : (
                  <MapPin className="w-10 h-10 text-secondary drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                )}
              </div>

              <span className="text-2xl font-black text-white mb-2 tracking-tighter uppercase italic">{label}</span>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-8">{sublabel}</span>

              <div className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-all duration-300">
                <Upload className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Connect Dataset</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-6 flex items-center gap-2 px-5 py-2.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl backdrop-blur-md"
          >
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">{error}</span>
          </motion.div>
        )}
      </label>
    </motion.div>
  );
}

export function UploadScreen({ onFilesUploaded }: UploadScreenProps) {
  const [beforeFile, setBeforeFile] = useState<{ data: GeoJSONData; name: string } | null>(null);
  const [afterFile, setAfterFile] = useState<{ data: GeoJSONData; name: string } | null>(null);

  const canStartAnalysis = beforeFile !== null && afterFile !== null;

  const handleStartAnalysis = () => {
    if (beforeFile && afterFile) {
      onFilesUploaded({
        before: beforeFile.data,
        after: afterFile.data,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative z-10 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, type: "spring", bounce: 0.4 }}
        className="text-center mb-16 relative"
      >
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-primary/20 blur-3xl rounded-full" />
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-4 italic uppercase">
          INSIGHT<span className="text-primary not-italic">GEO</span>
        </h1>
        <p className="text-xs font-black uppercase tracking-[0.5em] text-muted-foreground">
          Autonomous LULC Detection & Intelligence
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full max-w-5xl"
      >
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <DropZone
            label="Baseline"
            sublabel="Historical Matrix (T1)"
            file={beforeFile?.data ?? null}
            fileName={beforeFile?.name ?? null}
            onFileSelect={(data, name) => setBeforeFile({ data, name })}
            icon="before"
          />

          <DropZone
            label="Target"
            sublabel="Current Matrix (T2)"
            file={afterFile?.data ?? null}
            fileName={afterFile?.name ?? null}
            onFileSelect={(data, name) => setAfterFile({ data, name })}
            icon="after"
          />
        </div>

        <div className="h-20 flex items-center justify-center">
          <AnimatePresence>
            {canStartAnalysis ? (
              <motion.button
                key="btn-active"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartAnalysis}
                className="btn-cyber flex items-center gap-4 group"
              >
                <span className="text-sm uppercase tracking-[0.3em] font-black text-white pl-2">Initialize Analysis</span>
                <div className="p-1 rounded-lg bg-white/20 group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </motion.button>
            ) : (
              <motion.p
                key="instruction"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full border border-muted-foreground/30 animate-ping" />
                Pending Data Connection
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <footer className="fixed bottom-8 left-0 w-full px-8 flex justify-between items-end opacity-40">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-white">System Ready</span>
          <span className="text-[9px] font-mono text-muted-foreground uppercase">Waiting for input stream...</span>
        </div>
        <div className="text-[9px] font-mono text-muted-foreground uppercase text-right">
          Security: AES-256 Client-Side<br />
          Processing: Local WebAssembly
        </div>
      </footer>
    </div>
  );
}
