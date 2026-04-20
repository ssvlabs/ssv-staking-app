"use client";

/* eslint-disable @next/next/no-img-element */
import { useTheme } from "@/lib/theme";
import { useCompliance } from "@/hooks/use-compliance";

const SSV_WEBSITE = "https://ssv.network";

export const Compliance = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const logoSrc = isDark
    ? "/figma/logoStaking-dark.svg"
    : "/figma/logoStaking.svg";
  const toggleLight = "/figma/modeToggle.svg";
  const toggleDark = "/figma/modeToggle-dark.svg";

  const compliance = useCompliance();

  return (
    <div className="flex h-screen w-full flex-col items-center">
      <header className="w-full border-b border-border">
        <div className="flex h-[72px] items-center justify-between px-6">
          <img
            alt="ssv.network staking"
            src={logoSrc}
            className="h-[32px] w-[160px]"
            width={160}
            height={32}
          />
          <button
            type="button"
            onClick={toggleTheme}
            className="relative h-[28px] w-[44px]"
            aria-label="Theme toggle"
          >
            <span className="relative block size-full">
              <img
                alt=""
                aria-hidden="true"
                src={toggleLight}
                className={`absolute inset-0 size-full transition-all duration-200 ease-out ${
                  isDark
                    ? "translate-x-1 opacity-0"
                    : "translate-x-0 opacity-100"
                }`}
                width={44}
                height={28}
              />
              <img
                alt=""
                aria-hidden="true"
                src={toggleDark}
                className={`absolute inset-0 size-full transition-all duration-200 ease-out ${
                  isDark
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-1 opacity-0"
                }`}
                width={44}
                height={28}
              />
            </span>
          </button>
        </div>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center">
        <img
          src="/images/complianceRobot.svg"
          alt="Access restricted"
          className="w-40"
        />
        <h2 className="mt-16 text-2xl font-bold text-gray-700 dark:text-gray-300">
          Website not available
        </h2>
        <div className="mt-7 flex flex-col gap-2 text-center">
          {compliance.data && (
            <p className="text-base font-semibold">
              We noticed you are located in {compliance.data}
            </p>
          )}
          <p className="text-base font-medium">
            Please note that the website{" "}
            <span className="text-primary-500">{typeof window !== "undefined" ? window.location.host : ""}</span>{" "}
            is not available in your country
          </p>
          <a
            href={SSV_WEBSITE}
            target="_blank"
            rel="noreferrer"
            className="mt-2 text-[#1ba5f8] underline hover:opacity-80"
          >
            Learn more about the SSV Network
          </a>
        </div>
      </div>
    </div>
  );
};
