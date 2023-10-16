import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignOutButton, OrganizationSwitcher } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

function Topbar() {
  return (
    <nav className="topbar">
      <Link href="/" className="flex items-center gap-4">
        <Image
          src="/assets/logo.svg"
          alt="Meta Threads"
          width={32}
          height={32}
        />
        <p className="text-heading3-bold text-light-1 max-xs:hidden">Threads</p>
      </Link>

      <div className="flex items-center gap-1">
        <div className="block md:hidden">
          <SignedIn>
            <SignOutButton>
              <button className="flex cursor-pointer">
                <Image
                  src="/assets/logout.svg"
                  alt="Sign Out"
                  width={24}
                  height={24}
                />
              </button>
            </SignOutButton>
          </SignedIn>
        </div>
        <OrganizationSwitcher
          appearance={{
            baseTheme: dark,
            elements: {
              organizationSwitcherTrigger: "py-2 px-4 rounded-md bg-dark-2",
            },
          }}
        />
      </div>
    </nav>
  );
}

export default Topbar;
