"use client";

import Link from "next/link";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar.jsx";
import { PlusCircle, Wallet, PiggyBank } from "lucide-react";

export function TransactionsSidebar() {
  return (
    <Sidebar>
      {/* Cabeçalho do menu */}
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <span className="font-semibold text-sm">Finance App</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Grupo de atalhos principais */}
        <SidebarGroup>
          <SidebarGroupLabel>Atalhos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Nova transação */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Nova transação">
                  <Link href="/transactions/new">
                    <PlusCircle />
                    <span>Nova transação</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Nova conta */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Nova conta">
                  <Link href="/accounts/new">
                    <Wallet />
                    <span>Nova conta</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Novo orçamento */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Novo orçamento">
                  <Link href="/budgets/new">
                    <PiggyBank />
                    <span>Novo orçamento</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Exemplo de outro grupo (opcional) */}
        <SidebarGroup>
          <SidebarGroupLabel>Relatórios</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Visão geral">
                  <Link href="/reports/overview">
                    <span>Visão geral</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
