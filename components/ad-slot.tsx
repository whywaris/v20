import Script from "next/script";

// One responsive AdSense unit. Renders nothing until NEXT_PUBLIC_ADSENSE_CLIENT/SLOT are set, or for Pro viewers.
export function AdSlot({ hidden }: { hidden?: boolean }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const slot = process.env.NEXT_PUBLIC_ADSENSE_SLOT;
  if (hidden || !client || !slot) return null;
  return (
    <aside aria-label="Advertisement" className="min-h-[100px]">
      <Script id="adsense" async strategy="afterInteractive" crossOrigin="anonymous"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`} />
      <ins className="adsbygoogle block" data-ad-client={client} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" />
      <Script id={`adsense-push-${slot}-${Math.random().toString(36).slice(2)}`} strategy="afterInteractive">
        {"(window.adsbygoogle = window.adsbygoogle || []).push({});"}
      </Script>
    </aside>
  );
}
