"use client";

import { Menu } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

export default function ToggleSidebar({
  children,
}: {
  children?: React.ReactNode;
}) {
  const toggleSidebar = () => {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      const hasOpenClass = sidebar.classList.contains("sidebar-open");
      if (hasOpenClass) {
        sidebar.classList.remove("sidebar-open");
        sidebar.classList.add("sidebar-close");
      } else {
        sidebar.classList.add("sidebar-open");
        sidebar.classList.remove("sidebar-close");
      }
    }
  };
  return (
    <Button type="button" onClick={ toggleSidebar } variant="ghost">
      { children || <Menu /> }
    </Button>
  );
}
