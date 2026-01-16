import React, { useEffect, useRef } from 'react';

interface AdUnitProps {
  client?: string;
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const AdUnit: React.FC<AdUnitProps> = ({
  client = "ca-pub-3982840732098678", // Your Client ID
  slot,
  format = 'auto',
  responsive = true,
  style = { display: 'block' },
  className
}) => {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      // Check if ad has already loaded in this slot to prevent React double-render issues
      if (adRef.current && adRef.current.innerHTML === "") {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      }
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <div className={`ad-container my-8 ${className}`}>
      <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block text-center">Advertisement</span>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={style}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
};

export default AdUnit;
