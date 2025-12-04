'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  ChevronDown,
  UserPlus,
  UserCheck,
  Camera,
  Upload,
  Image as ImageIcon,
  Home,
  LayoutDashboard
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const menuItems = [
  {
    title: 'User Management',
    icon: Users,
    href: '/admin/users',
    items: [
      { title: 'All Users', icon: Users, href: '/admin/users' },
      { title: 'Add User', icon: UserPlus, href: '/admin/users/add' },
      { title: 'Groups', icon: UserCheck, href: '/admin/groups' },
      { title: 'Add Group', icon: UserPlus, href: '/admin/groups/add' },

    ],
  },
  {
    title: 'Photography',
    icon: Camera,
    href: '/admin/photos',
    items: [
      { title: 'Photo Gallery', icon: ImageIcon, href: '/admin/photos' },
      { title: 'Upload Photos', icon: Upload, href: '/admin/photos/upload' },
    ],
  },
];

export default function AdminSidebar() {
  const [openGroups, setOpenGroups] = useState<string[]>(['User Management']);
  const pathname = usePathname();

  const toggleGroup = (groupTitle: string) => {
    setOpenGroups(prev =>
      prev.includes(groupTitle)
        ? prev.filter(title => title !== groupTitle)
        : [...prev, groupTitle]
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Admin Panel</h2>
          <Link
            href="/"
            className="p-2 hover:bg-accent rounded-md transition-colors"
            title="Go to main website"
          >
            <Home className="h-5 w-5" />
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard link */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin'}>
                  <Link href="/admin">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {menuItems.map((group) => (
                <Collapsible
                  key={group.title}
                  open={openGroups.includes(group.title)}
                  onOpenChange={() => toggleGroup(group.title)}
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="w-full" asChild>
                        <div className={'cursor-pointer'}>
                          <group.icon className="h-4 w-4" />
                          <span>{group.title}</span>
                          <ChevronDown
                            className={`ml-auto h-4 w-4 transition-transform ${
                              openGroups.includes(group.title) ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {group.items.map((item) => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === item.href}
                            >
                              <Link href={item.href}>
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}