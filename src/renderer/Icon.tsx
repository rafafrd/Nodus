type Kind = 'orbit' | 'note' | 'book' | 'focus' | 'check' | 'search' | 'expand' | 'collapse' | 'arrow' | 'folder' | 'layout' | 'bold' | 'italic' | 'heading' | 'bullet' | 'link' | 'code' | 'table';
export function Icon({ kind = 'orbit' }: { kind?: Kind }) {
  const paths = {
    orbit: <><circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="10" ry="5" transform="rotate(-35 12 12)"/></>,
    note: <path d="M6 3h9l3 3v15H6zM14 3v5h4M9 12h6M9 16h5"/>,
    book: <path d="M3 5c4-1 7 0 9 2 2-2 5-3 9-2v15c-4-1-7 0-9 1-2-1-5-2-9-1zM12 7v14"/>,
    focus: <><circle cx="12" cy="13" r="8"/><path d="M12 9v5l3 2M9 2h6M12 5V2"/></>,
    check: <><rect x="4" y="4" width="16" height="16"/><path d="m8 12 3 3 5-6"/></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></>,
    expand: <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>,
    collapse: <path d="M3 8h5V3m8 0v5h5M8 21v-5H3m13 5v-5h5"/>,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6"/>,
    folder: <path d="M3 7V5h6l2 2h10v13H3zM3 10h18"/>,
    layout: <><rect x="3" y="4" width="18" height="16"/><path d="M12 4v16M3 12h18"/></>,
    bold: <path d="M8 4h5a4 4 0 0 1 0 8H8m0-8v16h6a4 4 0 0 0 0-8H8"/>,
    italic: <path d="M11 4h7M6 20h7M15 4 9 20"/>,
    heading: <path d="M5 5v14M15 5v14M5 12h10m3 4h3v4h-3v-2h3"/>,
    bullet: <><path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4" cy="6" r=".8"/><circle cx="4" cy="12" r=".8"/><circle cx="4" cy="18" r=".8"/></>,
    link: <><path d="m9 15 6-6m-5-2 2-2a4 4 0 0 1 6 6l-2 2m-2 4-2 2a4 4 0 0 1-6-6l2-2"/></>,
    code: <path d="m7 6-5 6 5 6m10-12 5 6-5 6m-3-15-4 18"/>,
    table: <><rect x="3" y="4" width="18" height="16"/><path d="M3 9h18M3 14h18M9 9v11M15 9v11"/></>,
  };
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind]}</svg>;
}
