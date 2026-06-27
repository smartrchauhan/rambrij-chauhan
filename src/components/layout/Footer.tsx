export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-16">
      <div className="mx-auto max-w-5xl px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Ram Brij. All rights reserved.</p>
        <p>IEEE Senior Member · International Speaker · Published Author</p>
      </div>
    </footer>
  );
}
