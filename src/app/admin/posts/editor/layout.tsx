export default function EditorLayout({ children }: { children: React.ReactNode }) {
  // Break out of the admin layout's max-w-5xl px-4 py-10 container
  return (
    <div className="-mx-4 -my-10">
      {children}
    </div>
  );
}
