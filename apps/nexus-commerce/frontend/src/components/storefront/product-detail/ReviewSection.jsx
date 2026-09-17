import React from "react";
import { Star, CheckCircle2, User } from "lucide-react";

export function ReviewSection() {
  const REVIEWS = [
    {
      author: "Farhan A.",
      verified: true,
      rating: 5,
      date: "2 days ago",
      comment:
        "Biometric Passkey checkout took literally 2 seconds on my iPhone. Item arrived in Lahore within 24 hours!",
    },
    {
      author: "Zainab K.",
      verified: true,
      rating: 5,
      date: "1 week ago",
      comment:
        "Excellent build quality and packaging. Live GPS courier tracking worked accurately.",
    },
  ];

  return (
    <div className="p-6 rounded-3xl bg-surface-card border border-border-main space-y-5">
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <div>
          <h3 className="text-sm font-bold text-text-main">
            Verified Customer Reviews
          </h3>
          <p className="text-xs text-text-muted">
            Authenticated buyer feedback
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-400">
          4.9 / 5.0 Rating
        </span>
      </div>

      <div className="space-y-4 divide-y divide-border-subtle">
        {REVIEWS.map((rev, i) => (
          <div key={i} className="pt-4 first:pt-0 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-surface-elevated flex items-center justify-center text-[10px] font-mono font-bold">
                  {rev.author[0]}
                </div>
                <span className="font-semibold text-text-main">
                  {rev.author}
                </span>
                {rev.verified && (
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono text-text-faint">
                {rev.date}
              </span>
            </div>

            <div className="flex text-amber-400">
              {Array.from({ length: rev.rating }).map((_, r) => (
                <Star key={r} className="w-3 h-3 fill-current" />
              ))}
            </div>

            <p className="text-text-muted leading-relaxed">{rev.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
