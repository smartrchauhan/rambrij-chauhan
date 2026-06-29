import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultAbout = {
  title: "Senior Engineering Manager",
  bio: "Ram Brij is a Senior Engineering Manager with over 18 years of experience designing, building, and optimizing high-performance, cloud-native, and distributed enterprise systems. He specializes in software architecture, performance engineering, microservices, AI-powered applications, and modern quality engineering practices.",
  expertise: [
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
  ],
  highlights: [
    {
      title: "Mission-Critical Platforms",
      description:
        "Led development of platforms supporting secure digital payments, fraud detection, and high-throughput transaction processing including EMVCo-certified Access Control Server (ACS) solutions for 3-D Secure authentication.",
    },
    {
      title: "Creator of the SCALE Framework",
      description:
        "Developed the SCALE Framework — a practical performance engineering model built from real-world enterprise experience that helps engineering teams evolve from traditional performance testing to continuous performance engineering.",
    },
    {
      title: "Thought Leadership",
      description:
        "International conference speaker, IEEE Senior Member, published author, and active peer reviewer passionate about sharing practical engineering strategies for building reliable, scalable, resilient, and cost-efficient software.",
    },
  ],
  connect: "Interested in discussing software architecture, performance engineering, or speaking engagements? Feel free to reach out or leave a comment on any article.",
};

async function main() {
  await prisma.siteContent.upsert({
    where: { key: "about" },
    update: { value: JSON.stringify(defaultAbout) },
    create: { key: "about", value: JSON.stringify(defaultAbout) },
  });
  console.log("About content seeded.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
