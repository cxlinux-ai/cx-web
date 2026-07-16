import { Twitter } from "lucide-react";

interface Author {
  id: string;
  name: string;
  title: string;
  avatar: string;
  twitter?: string;
  bio: string;
}

interface AuthorCardProps {
  author: Author;
}

export function AuthorCard({ author }: AuthorCardProps) {
  return (
    <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-6 flex gap-4 items-start">
      <img
        src={author.avatar}
        alt={author.name}
        width={56}
        height={56}
        className="w-14 h-14 rounded-full ring-2 ring-[#00FF9F]/30 object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <span className="font-bold text-white">{author.name}</span>
          {author.twitter && (
            <a
              href={`https://twitter.com/${author.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-[#00FF9F] transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-2">{author.title}</p>
        <p className="text-sm text-gray-400 leading-relaxed">{author.bio}</p>
      </div>
    </div>
  );
}
