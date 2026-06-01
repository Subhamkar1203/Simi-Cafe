"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface AnimatedTabsProps {
  tabs?: Tab[];
  defaultTab?: string;
  className?: string;
}

const defaultTabs: Tab[] = [
  {
    id: "forest",
    label: "Forest",
    content: (
      <div className="grid h-full w-full gap-4 sm:grid-cols-2">
        <img
          src="/images/forest_statue.jpg"
          alt="Mossy forest path"
          className="!m-0 h-60 w-full rounded-lg border-none object-cover shadow-[0_0_20px_rgba(61,43,31,0.2)]"
        />
        <div className="flex flex-col gap-y-2">
          <h2 className="!m-0 text-2xl font-bold text-white">Forest Corner</h2>
          <p className="mt-0 text-sm text-amber-50/85">
            Ferns, warm lamps, and a table tucked away for quiet afternoons.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "garden",
    label: "Garden",
    content: (
      <div className="grid h-full w-full gap-4 sm:grid-cols-2">
        <img
          src="/images/arrietty_garden.jpg"
          alt="Green cafe garden"
          className="!m-0 h-60 w-full rounded-lg border-none object-cover shadow-[0_0_20px_rgba(61,43,31,0.2)]"
        />
        <div className="flex flex-col gap-y-2">
          <h2 className="!m-0 text-2xl font-bold text-white">Garden Table</h2>
          <p className="mt-0 text-sm text-amber-50/85">
            Seasonal drinks, tiny sweets, and sunlight through leaves.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "meadow",
    label: "Meadow",
    content: (
      <div className="grid h-full w-full gap-4 sm:grid-cols-2">
        <img
          src="/images/totoro_field.jpg"
          alt="Open meadow at golden hour"
          className="!m-0 h-60 w-full rounded-lg border-none object-cover shadow-[0_0_20px_rgba(61,43,31,0.2)]"
        />
        <div className="flex flex-col gap-y-2">
          <h2 className="!m-0 text-2xl font-bold text-white">Meadow Window</h2>
          <p className="mt-0 text-sm text-amber-50/85">
            A bright spot for sketchbooks, matcha, and slow conversations.
          </p>
        </div>
      </div>
    ),
  },
];

const AnimatedTabs = ({
  tabs = defaultTabs,
  defaultTab,
  className,
}: AnimatedTabsProps) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab || tabs[0]?.id);

  if (!tabs?.length) return null;

  return (
    <div className={cn("flex w-full max-w-2xl flex-col gap-y-1", className)}>
      <div className="flex flex-wrap gap-2 rounded-xl bg-[#3d2b1f]/70 p-1 backdrop-blur-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative rounded-lg px-3 py-1.5 text-sm font-medium text-white outline-none transition-colors"
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 rounded-lg bg-[#111111d1] shadow-[0_0_20px_rgba(0,0,0,0.2)] backdrop-blur-sm"
                transition={{ type: "spring", duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="min-h-60 rounded-xl border border-white/15 bg-[#3d2b1f]/70 p-4 text-white shadow-[0_0_20px_rgba(61,43,31,0.22)] backdrop-blur-sm">
        {tabs.map(
          (tab) =>
            activeTab === tab.id && (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, scale: 0.95, x: -10, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, x: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.5, ease: "circInOut" }}
              >
                {tab.content}
              </motion.div>
            ),
        )}
      </div>
    </div>
  );
};

export { AnimatedTabs };
