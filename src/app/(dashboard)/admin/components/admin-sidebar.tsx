'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Settings,
  Database,
  ChevronDown,
  UserPlus,
  UserCheck,
  Lock,
  Monitor,
  Bell,
  FileText,
  BarChart3,
  Activity,
  Camera,
  Upload,
  Image as ImageIcon,
  Home,
  LayoutDashboard,
  RefreshCw
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
  {
    title: 'System Settings',
    icon: Settings,
    href: '/admin/settings',
    items: [
      { title: 'General', icon: Settings, href: '/admin/settings' },
      { title: 'Security', icon: Lock, href: '/admin/settings/security' },
      { title: 'Monitoring', icon: Monitor, href: '/admin/settings/monitoring' },
      { title: 'Notifications', icon: Bell, href: '/admin/settings/notifications' },
      { title: 'Data Migration', icon: RefreshCw, href: '/admin/settings/migrations' },
    ],
  },
  {
    title: 'Database Operations',
    icon: Database,
    href: '/admin/database',
    items: [
      { title: 'Query Builder', icon: Database, href: '/admin/database' },
      { title: 'Backups', icon: FileText, href: '/admin/database/backups' },
      { title: 'Analytics', icon: BarChart3, href: '/admin/database/analytics' },
      { title: 'Performance', icon: Activity, href: '/admin/database/performance' },
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
                        <Link href={group.href}>
                          <group.icon className="h-4 w-4" />
                          <span>{group.title}</span>
                          <ChevronDown
                            className={`ml-auto h-4 w-4 transition-transform ${
                              openGroups.includes(group.title) ? 'rotate-180' : ''
                            }`}
                          />
                        </Link>
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