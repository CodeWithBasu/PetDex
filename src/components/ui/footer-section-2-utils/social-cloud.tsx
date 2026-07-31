import { Github, Twitter, Linkedin, Discord } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function SocialCloud({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center", className)}>
      <Link href="#" className="hover:text-white transition-colors">
        <Twitter className="size-5" />
      </Link>
      <Link href="#" className="hover:text-white transition-colors">
        <Github className="size-5" />
      </Link>
      <Link href="#" className="hover:text-white transition-colors">
        <Linkedin className="size-5" />
      </Link>
    </div>
  );
}
