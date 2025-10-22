
import * as React from 'react';
import { SyncStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { Cloud, CloudCog, AlertTriangle, Copy, LogOut, Moon, Sun, PanelLeft } from 'lucide-react';
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from '@/components/ui/sidebar-new';


type HeaderProps = {
  dashboardName: string;
  syncStatus: SyncStatus;
  familyId: string;
  onSignOut: () => void;
};

const statusConfig = {
  loading: {
    icon: <CloudCog className="h-4 w-4 animate-spin text-blue-600" />,
    text: 'जडानको लागि पर्खँदै...',
    className: 'text-blue-600 bg-blue-100',
  },
  'synced-cloud': {
    icon: <Cloud className="h-4 w-4 text-green-600" />,
    text: 'क्लाउड जडान भयो। (रियल-टाइम)',
    className: 'text-green-600 bg-green-100',
  },
  'synced-local': {
    icon: <CloudCog className="h-4 w-4 text-primary-foreground" />,
    text: 'डाटा सुरक्षित छ। (Local)',
    className: 'bg-primary text-primary-foreground',
  },
  error: {
    icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
    text: 'त्रुटि: जडान टुट्यो।',
    className: 'text-red-600 bg-red-100',
  },
};

export const Header: React.FC<HeaderProps> = ({ dashboardName, syncStatus, familyId, onSignOut }) => {
  const { toast } = useToast();
  const { setTheme } = useTheme();
  const { toggleSidebar } = useSidebar();
  const currentStatus = statusConfig[syncStatus];

  const handleCopy = () => {
    navigator.clipboard.writeText(familyId);
    toast({
      title: "सफल भयो!",
      description: "परिवारको साझा डाटा कोड प्रतिलिपि गरियो।",
    });
  };

  return (
    <header className="bg-card p-4 rounded-xl shadow-lg border">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={toggleSidebar}
              >
                <PanelLeft />
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                  {dashboardName}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" onClick={onSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
              </Button>
            </div>
        </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-muted-foreground space-y-2 sm:space-y-0">
        <Badge
          variant="outline"
          className={`flex items-center space-x-2 font-semibold p-1 rounded-lg ${currentStatus.className}`}
        >
          {currentStatus.icon}
          <span>{currentStatus.text}</span>
        </Badge>
        <div className="text-sm font-medium flex items-center space-x-2">
          <span className="text-foreground/80">परिवारको साझा डाटा कोड:</span>
          <Badge variant="secondary" className="font-bold text-primary-blue select-all">{familyId}</Badge>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy} title="कोड प्रतिलिपि गर्नुहोस्">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
