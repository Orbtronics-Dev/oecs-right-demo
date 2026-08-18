import Callout from "@/components/callout";
import type { UpdateBlock } from "@/data/mockData";

/**
 * Renders an article body from structured blocks.
 *
 * Deliberately not `dangerouslySetInnerHTML`: the content model is a closed set
 * of block types, so an article can never introduce markup the design system has
 * not accounted for, and there is no injection surface if these bodies ever come
 * from a CMS.
 */
const UpdateBody = ({ blocks }: { blocks: UpdateBlock[] }) => (
  <div className="mt-10 space-y-6">
    {blocks.map((block, index) => {
      const key = `${block.type}-${index}`;

      switch (block.type) {
        case "heading":
          return (
            <h2 key={key} className="display-3 pt-4 text-ink">
              {block.text}
            </h2>
          );

        case "paragraph":
          return (
            <p key={key} className="prose-editorial">
              {block.text}
            </p>
          );

        case "list":
          return (
            <ul key={key} className="space-y-3">
              {block.items.map((item) => (
                <li key={item} className="flex gap-4">
                  <span
                    className="mt-[0.6875rem] h-px w-4 shrink-0 bg-brand-green"
                    aria-hidden="true"
                  />
                  <span className="prose-editorial">{item}</span>
                </li>
              ))}
            </ul>
          );

        case "quote":
          return (
            <blockquote key={key} className="border-l-2 border-brand-green py-2 pl-6">
              <p className="voice">{block.text}</p>
              <footer className="mt-3 text-[0.8125rem] text-g-600">{block.attribution}</footer>
            </blockquote>
          );

        case "note":
          return (
            <Callout key={key} variant={block.variant} title={block.title} className="my-8">
              {block.text}
            </Callout>
          );
      }
    })}
  </div>
);

export default UpdateBody;
