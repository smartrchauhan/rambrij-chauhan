export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-16">
      <div className="mx-auto max-w-5xl px-4 py-8 flex flex-col items-center gap-2 text-sm text-gray-500 text-center">
        <p className="text-xs text-gray-400 leading-relaxed">Enterprise Technology Strategist · Engineering Leader · Software Architect · AI Strategist · Speaker · IEEE Senior Member</p>
        <p>© {new Date().getFullYear()} Ram Brij. All rights reserved.</p>
      </div>
    </footer>
  );
}
