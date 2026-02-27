interface EvidenceViewerProps {
  title: string;
  details?: string | null;
}

const EvidenceViewer = ({ title, details }: EvidenceViewerProps) => {
  return (
    <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-4">
      <p className="text-sm font-semibold text-white mb-2">{title}</p>
      <p className="text-xs text-zinc-400 whitespace-pre-wrap">{details || 'No evidence attached yet.'}</p>
    </div>
  );
};

export default EvidenceViewer;
