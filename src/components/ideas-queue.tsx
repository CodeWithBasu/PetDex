import { Lightbulb } from "lucide-react";

import type { PetIdea } from "@/lib/ideas";

type IdeasQueueProps = {
  ideas: PetIdea[];
};

export function IdeasQueue({ ideas }: IdeasQueueProps) {
  if (ideas.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-cyan-700 uppercase">
            Hatch queue
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-stone-950">
            Planned pets
          </h2>
        </div>
        <div className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700">
          {ideas.length} ideas
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {ideas.map((idea) => (
          <article
            key={idea.id}
            className="rounded-lg border border-stone-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="rounded-md bg-amber-50 p-2 text-amber-800">
                <Lightbulb className="size-4" />
              </div>
              <span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-600">
                {idea.featured ? "featured" : idea.status}
              </span>
            </div>
            <h3 className="mt-4 font-semibold text-stone-950">{idea.name}</h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600">
              {idea.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {idea.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-cyan-50 px-2 py-1 text-xs font-medium text-cyan-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
