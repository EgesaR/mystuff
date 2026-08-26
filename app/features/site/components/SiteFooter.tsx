import { Link } from "react-router";

const FOOTER_LINKS: {
  label: string;
  href: `/${string}`;
}[] = [
  { label: "About", href: "/about" },
  { label: "Docs", href: "/docs" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const SiteFooter = () => {
  return (
    <footer className='border-t bg-background text-foreground'>
      <div className='mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 sm:flex-row sm:items-start sm:justify-between'>
        <div className='max-w-sm'>
          <Link
            to='/'
            className='inline-block transition-opacity hover:opacity-80'
          >
            <p
              className='text-lg italic tracking-tight'
              style={{
                fontFamily: "'Fraunces', serif",
              }}
            >
              My Stuff
            </p>
          </Link>

          <p className='mt-2 text-sm leading-6 text-muted-foreground'>
            One place to file notes, files, and everything in between — indexed,
            searchable, and yours.
          </p>
        </div>

        <nav
          className='flex flex-col gap-2 font-mono text-xs uppercase tracking-[0.14em]'
          aria-label='Footer'
        >
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className='text-muted-foreground transition-colors hover:text-foreground'
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className='border-t py-4 px-6 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground'>
        &copy; {new Date().getFullYear()} My Stuff — Filled, not forgotten.
      </div>
    </footer>
  );
};

export default SiteFooter;
