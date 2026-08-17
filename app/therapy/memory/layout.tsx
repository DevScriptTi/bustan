import React from "react";

export default function MemoryTherapyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex flex-col flex-1">{children}</div>;
}
