import Link from "next/link";

const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);

const Twitter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

const Discord = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M7.81 4.31a9.8 9.8 0 0 0-3 1.5 13.9 13.9 0 0 0-3 9.4 10.3 10.3 0 0 0 3.1 3.5 10.3 10.3 0 0 0 4.3-1.6 8 8 0 0 1-.3-1.7 8.3 8.3 0 0 1-2-.5 8.1 8.1 0 0 1 2-2 13 13 0 0 0 6.2 0 8.1 8.1 0 0 1 2 2 8.3 8.3 0 0 1-2 .5 8 8 0 0 1-.3 1.7 10.3 10.3 0 0 0 4.3 1.6 10.3 10.3 0 0 0 3.1-3.5 13.9 13.9 0 0 0-3-9.4 9.8 9.8 0 0 0-3-1.5 8 8 0 0 0-4.8 0Z"/></svg>
);

export function SocialCloud({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className || ""}`}>
      <Link
        href="https://github.com/CodeWithBasu/PetDex"
        className="rounded-full bg-white/10 p-3 transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:-rotate-6"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Github className="h-5 w-5" />
      </Link>
      <Link
        href="#"
        className="rounded-full bg-white/10 p-3 transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:rotate-6"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Twitter className="h-5 w-5" />
      </Link>
      <Link
        href="#"
        className="rounded-full bg-white/10 p-3 transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:-rotate-6"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Linkedin className="h-5 w-5" />
      </Link>
      <Link
        href="#"
        className="rounded-full bg-white/10 p-3 transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:rotate-6"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Discord className="h-5 w-5" />
      </Link>
    </div>
  );
}
