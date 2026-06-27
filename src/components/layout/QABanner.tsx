export default function QABanner() {
  const env = process.env.NEXT_PUBLIC_ENV;
  if (env !== "qa") return null;

  return (
    <div className="w-full bg-amber-400 text-amber-900 text-center text-xs font-semibold py-1.5 tracking-wide uppercase">
      QA Environment — Not production data
    </div>
  );
}
