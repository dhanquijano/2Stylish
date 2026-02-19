"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/components/SignOutAction";
import React, { useState } from "react";
import { Session } from "next-auth";
import { Menu, X } from "lucide-react";

const Header = ({ session }: { session: Session }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="my-6 md:my-10">
      <div className="flex justify-between items-center gap-5">
        <Link href="/">
          <Image src="/icons/sanbry logo.png" alt="logo" width={40} height={40} className="w-8 h-8 md:w-10 md:h-10" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex">
          <ul className="flex flex-row items-center gap-6 lg:gap-8">
            <li>
              <Link className="text-base lg:text-lg text-primary hover:text-primary/80 transition-colors" href="/appointments">
                Appointments
              </Link>
            </li>
            <li>
              <Link className="text-base lg:text-lg text-primary hover:text-primary/80 transition-colors" href="/contact">
                Contact Us
              </Link>
            </li>
            {session?.user ? (
              <>
                {(session?.user?.role === "ADMIN" ||
                  session?.user?.role === "MANAGER" ||
                  session?.user?.role === "STAFF") && (
                  <li>
                    <a href="/admin" className="text-base lg:text-lg text-primary hover:text-primary/80 transition-colors">
                      Admin Panel
                    </a>
                  </li>
                )}
                <li>
                  <form action={signOutAction}>
                    <Button className="text-base lg:text-lg cursor-pointer bg-transparent text-primary border-none hover:bg-transparent hover:text-primary/80 active:bg-transparent focus:outline-none p-0">
                      Logout
                    </Button>
                  </form>
                </li>
              </>
            ) : (
              <li>
                <a href="/sign-in" className="text-base lg:text-lg text-primary hover:text-primary/80 transition-colors">
                  Login
                </a>
              </li>
            )}
          </ul>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-primary p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden mt-4 pb-4 border-b border-light-700">
          <ul className="flex flex-col gap-4">
            <li>
              <Link 
                className="text-base text-primary hover:text-primary/80 transition-colors block py-2" 
                href="/appointments"
                onClick={() => setMobileMenuOpen(false)}
              >
                Appointments
              </Link>
            </li>
            <li>
              <Link 
                className="text-base text-primary hover:text-primary/80 transition-colors block py-2" 
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact Us
              </Link>
            </li>
            {session?.user ? (
              <>
                {(session?.user?.role === "ADMIN" ||
                  session?.user?.role === "MANAGER" ||
                  session?.user?.role === "STAFF") && (
                  <li>
                    <a 
                      href="/admin" 
                      className="text-base text-primary hover:text-primary/80 transition-colors block py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Panel
                    </a>
                  </li>
                )}
                <li>
                  <form action={signOutAction}>
                    <Button className="text-base cursor-pointer bg-transparent text-primary border-none hover:bg-transparent hover:text-primary/80 active:bg-transparent focus:outline-none p-0 py-2 w-full justify-start">
                      Logout
                    </Button>
                  </form>
                </li>
              </>
            ) : (
              <li>
                <a 
                  href="/sign-in" 
                  className="text-base text-primary hover:text-primary/80 transition-colors block py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </a>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
};
export default Header;
