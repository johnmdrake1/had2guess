import Header from "@/components/Header";

export default function About() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-semibold mb-4">About how2guess</h1>
        <div className="glass p-6 leading-relaxed">
          <p className="opacity-90">
            Put your intuition on the line. Each day you’ll face a single, verifiable
            yes/no dilemma. Pick an answer. We’ll reveal the truth with evidence.
          </p>
          <p className="opacity-90 mt-3">
            This page is a placeholder — add your story, credits, and attribution here.
          </p>
        </div>
      </main>
    </>
  );
}
