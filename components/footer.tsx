export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white backdrop-blur-xl border-t border-white/10 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-gray-500 text-sm text-center">
          © {currentYear} Zoop AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
