import logoLight from "../assets/logo.png";
import logoDark  from "../assets/WHITE.png";
import ThemeSwitch from "./ThemeSwitch";

export default function Navbar() {
  return (
    <header className="w-full border-b bg-white dark:bg-neutral-900">
      <nav className="max-w-screen-xl mx-auto flex items-center justify-between p-4">
        {/* light vs dark logo */}
        <img src={logoLight} className="h-8 select-none dark:hidden"  alt="Grain &co." />
        <img src={logoDark}  className="h-8 select-none hidden dark:block" alt="Grain &co." />

        <ThemeSwitch />
      </nav>
    </header>
  );
}
