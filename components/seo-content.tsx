import type { RoutePath } from "@/lib/seo";
import { pageAnswers, pageSchemas } from "@/lib/structured-data";

export function JsonLd({ data }: { data: unknown }) {
  if (!data) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function SeoContent({ path }: { path: RoutePath }) {
  const answers = pageAnswers(path);
  return <>
    <JsonLd data={pageSchemas(path)} />
    {answers.length > 0 && <section aria-labelledby="page-questions" className="bg-warm px-5 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-[92rem]">
        <h2 id="page-questions" className="text-3xl font-semibold sm:text-4xl">Common questions</h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">{answers.map(({ question, answer }) => <div key={question} className="border-t border-charcoal/12 pt-5">
          <h3 className="text-lg font-semibold">{question}</h3><p className="mt-3 max-w-3xl text-base leading-7 text-charcoal/68">{answer}</p>
        </div>)}</div>
      </div>
    </section>}
  </>;
}
