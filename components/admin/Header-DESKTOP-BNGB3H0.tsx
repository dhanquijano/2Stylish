import React from "react";
import { Session } from "next-auth";

const Header = ({ session }: { session: Session }) => {
  return (
    <header className="admin-header">
      <div className="lg:ml-0 ml-14">
        <h2 className="text-xl sm:text-2xl font-semibold text-dark-400">
          {session?.user?.name}
        </h2>
        <p className="text-sm sm:text-base text-slate-500">
          Monitor all appointments, services, and inventory from here
        </p>
      </div>
    </header>
  );
};
export default Header;
