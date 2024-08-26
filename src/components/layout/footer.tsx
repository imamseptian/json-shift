import { Button } from "@/components/ui/button";
import {
  Facebook,
  Globe, Linkedin,
  LucideGithub,
} from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="w-full md:w-auto text-center">
            <p className="text-sm">
              ©
              { ' ' }
              { new Date().getFullYear() }
              { ' ' }
              Razhael™. All Rights Reserved.
            </p>
          </div>
          <div className="flex mt-4 justify-center sm:mt-0 items-center">
            <Button variant="link" asChild>
              <Link
                href="https://www.facebook.com/imamseptian.wijaya"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-foreground hover:opacity-80"
              >
                <Facebook className="w-4 h-4" />
                <span className="sr-only">Facebook page</span>
              </Link>
            </Button>

            <Button variant="link" asChild>
              <Link
                href="https://discord.com/users/369754848435896322"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-foreground hover:opacity-80 ms-5"
              >
                <svg
                  className="w-4 h-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 21 16"
                >
                  <path d="M16.942 1.556a16.3 16.3 0 0 0-4.126-1.3 12.04 12.04 0 0 0-.529 1.1 15.175 15.175 0 0 0-4.573 0 11.585 11.585 0 0 0-.535-1.1 16.274 16.274 0 0 0-4.129 1.3A17.392 17.392 0 0 0 .182 13.218a15.785 15.785 0 0 0 4.963 2.521c.41-.564.773-1.16 1.084-1.785a10.63 10.63 0 0 1-1.706-.83c.143-.106.283-.217.418-.33a11.664 11.664 0 0 0 10.118 0c.137.113.277.224.418.33-.544.328-1.116.606-1.71.832a12.52 12.52 0 0 0 1.084 1.785 16.46 16.46 0 0 0 5.064-2.595 17.286 17.286 0 0 0-2.973-11.59ZM6.678 10.813a1.941 1.941 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.919 1.919 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045Zm6.644 0a1.94 1.94 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.918 1.918 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045Z" />
                </svg>
                <span className="sr-only">Discord community</span>
              </Link>
            </Button>

            <Button variant="link" asChild>
              <Link
                href="https://github.com/imamseptian"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-foreground hover:opacity-80 ms-5"
              >
                <LucideGithub className="w-4 h-4" />
                <span className="sr-only">GitHub account</span>
              </Link>
            </Button>

            <Button variant="link" asChild>
              <Link
                href="https://www.linkedin.com/in/imam-septian"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-foreground hover:opacity-80 ms-5"
              >
                <Linkedin className="w-4 h-4" />
                <span className="sr-only">Linkedin</span>
              </Link>
            </Button>
            <Button variant="link" asChild>
              <Link
                href="https://www.imamseptian.site"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-foreground hover:opacity-80 ms-5"
              >
                <Globe className="w-4 h-4" />
                <span className="sr-only">Linkedin</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
