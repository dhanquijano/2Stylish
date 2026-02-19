"use client";
import React, { useState } from "react";
import Image from "next/image";
import { adminSideBarLinks } from "@/constants";
import Link from "next/link";
import { cn, getInitials } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Session } from "next-auth";
import { getAdminNavItems } from "@/lib/admin-utils";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Sidebar = ({ session }: { session: Session }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Get navigation items based on user role
  const navItems = getAdminNavItems(session?.user?.role || "USER");

  const SidebarContent = () => (
    <>
      <div>
        <div className="logo">
          <Image
            src="/icons/sanbry logo.png"
            alt="logo"
            height={37}
            width={37}
          />
          <h1>2Stylish</h1>
        </div>

        <div className="mt-6 sm:mt-8 lg:mt-10 flex flex-col gap-3 sm:gap-4 lg:gap-5">
          {navItems.map((link) => {
            const isSelected =
              (link.route !== "/admin" &&
                pathname.includes(link.route) &&
                link.route.length > 1) ||
              pathname === link.route;

            return (
              <Link href={link.route} key={link.route} onClick={() => setMobileMenuOpen(false)}>
                <div
                  className={cn(
                    "link",
                    isSelected && "bg-primary-admin shadow-sm",
                  )}
                >
                  <div className="relative size-4 sm:size-5">
                    <Image
                      src={link.img}
                      alt="icon"
                      fill
                      className={`${isSelected ? "brightness-0 invert" : ""} object-contain`}
                    />
                  </div>

                  <p className={cn(isSelected ? "text-white" : "text-dark", "max-lg:block")}>
                    {link.text}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="user center">
        <Avatar>
          <AvatarFallback className="bg-amber-100">
            {getInitials(session?.user?.name || "IN")}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col max-lg:block">
          <p className="font-semibold text-dark-200 text-sm sm:text-base">{session?.user?.name}</p>
          <p className="text-xs sm:text-sm text-light-500">{session?.user?.email}</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-white shadow-md"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <div className="admin-sidebar">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <>
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="lg:hidden fixed left-0 top-0 h-full w-64 bg-white z-50 flex flex-col justify-between px-4 pb-5 pt-6 shadow-xl">
            <SidebarContent />
          </div>
        </>
      )}
    </>
  );
};
export default Sidebar;
