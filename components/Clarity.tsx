import Script from "next/script";

// Microsoft Clarity tracking tag. The project id is public (it ships in the
// page source either way), so it's baked in as the default; NEXT_PUBLIC_CLARITY_ID
// can override it without a code change. Returns null only if both are empty.
const DEFAULT_CLARITY_ID = "x4du7710pc";

export default function Clarity() {
  const id = process.env.NEXT_PUBLIC_CLARITY_ID ?? DEFAULT_CLARITY_ID;
  if (!id) return null;

  // Skip loading Clarity entirely for an opted-out (owner) browser — the
  // localStorage flag set on /optout. Wrapped in try/catch so a storage error
  // never blocks tracking for normal visitors.
  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`try{if(localStorage.getItem("sb_optout")==="1"){}else{
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${id}");
      }}catch(e){
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${id}");
      }`}
    </Script>
  );
}
