import Link from "next/link";

export default function SinBarsQuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/" className="btn btn-sm btn-outline">
        Retour accueil
      </Link>
      <a href="/SinBars/" target="_blank" rel="noreferrer" className="btn btn-sm">
        Ouvrir en plein écran
      </a>
    </div>
  );
}
