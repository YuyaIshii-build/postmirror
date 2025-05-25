"use client";

import { useState } from "react";
import { Settings, FilePlus, PenTool, ListChecks, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const menu = [
    { label: "ポストの生成", icon: FilePlus, href: "/facts" },
    { label: "採用済みのポスト一覧", icon: ListChecks, href: "/posts" },
    { label: "マーケティング設定", icon: Settings, href: "/setup" },
  ];

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } h-screen border-r bg-white transition-all duration-300 flex flex-col`}
    >
      {/* トグルボタン */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-2 hover:bg-gray-100 self-end"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* メニューリンク */}
      <nav className="flex-1 px-2 space-y-2">
        {menu.map(({ label, icon: Icon, href }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-sm ${
              pathname === href ? "bg-gray-200 font-medium" : ""
            }`}
          >
            <Icon className="w-5 h-5" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
