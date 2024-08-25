import Link from "next/link";
import ModelSelect from "./model-select";
import { ThemeToggler } from "./theme-toggler-button";

export default async function Navbar() {
  return (
    <nav className="w-full sticky top-0 z-50 shadow-md bg-background/90 backdrop-blur-sm">
      <div className="w-full py-3 flex items-center container justify-between">
        <Link href="/" className="items-center hidden md:flex">
          <div className="font-bold text-emerald-700 text-3xl mr-5">
            JSON
            <span className="text-fuchsia-700">Shift.</span>
          </div>
        </Link>

        <div className="flex w-full  justify-between md:justify-start md:w-fit">
          <ModelSelect />
          <ThemeToggler />
        </div>
      </div>
    </nav>
  );
}
