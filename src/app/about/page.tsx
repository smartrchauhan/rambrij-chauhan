import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Ram Brij",
  description:
    "Senior Engineering Manager with 18+ years experience in cloud-native systems, performance engineering, and microservices architecture.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">About Ram Brij</h1>
      <p className="text-lg text-blue-700 font-medium mb-10">Senior Engineering Manager</p>

      <section className="prose prose-gray max-w-none">
        <p className="text-lg leading-relaxed text-gray-700">
          Ram Brij is a Senior Engineering Manager with over <strong>18 years of experience</strong> designing,
          building, and optimizing high-performance, cloud-native, and distributed enterprise systems. He
          specializes in software architecture, performance engineering, microservices, AI-powered applications,
          and modern quality engineering practices.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Areas of Expertise</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            "Software Architecture & Design",
            "Performance Engineering",
            "Cloud-Native & Distributed Systems",
            "Microservices Architecture",
            "AI-Powered Applications",
            "Secure Digital Payments (3-D Secure / ACS)",
            "Event-Driven Systems",
            "CI/CD & DevOps Automation",
            "Observability & Monitoring",
            "Modern Quality Engineering",
          ].map((skill) => (
            <div key={skill} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-blue-600 flex-shrink-0" />
              <span className="text-gray-700">{skill}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Career Highlights</h2>
        <div className="space-y-6">
          <div className="border-l-4 border-blue-600 pl-5">
            <h3 className="font-semibold text-gray-900">Mission-Critical Platforms</h3>
            <p className="mt-1 text-gray-600">
              Led development of platforms supporting secure digital payments, fraud detection, and
              high-throughput transaction processing including EMVCo-certified Access Control Server (ACS)
              solutions for 3-D Secure authentication.
            </p>
          </div>
          <div className="border-l-4 border-blue-600 pl-5">
            <h3 className="font-semibold text-gray-900">Creator of the SCALE Framework</h3>
            <p className="mt-1 text-gray-600">
              Developed the SCALE Framework — a practical performance engineering model built from real-world
              enterprise experience that helps engineering teams evolve from traditional performance testing to
              continuous performance engineering.
            </p>
          </div>
          <div className="border-l-4 border-blue-600 pl-5">
            <h3 className="font-semibold text-gray-900">Thought Leadership</h3>
            <p className="mt-1 text-gray-600">
              International conference speaker, IEEE Senior Member, published author, and active peer reviewer
              passionate about sharing practical engineering strategies for building reliable, scalable, resilient,
              and cost-efficient software.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12 rounded-xl bg-blue-50 border border-blue-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Let&apos;s Connect</h2>
        <p className="text-gray-600 text-sm">
          Interested in discussing software architecture, performance engineering, or speaking engagements?
          Feel free to reach out or leave a comment on any article.
        </p>
      </section>
    </main>
  );
}
