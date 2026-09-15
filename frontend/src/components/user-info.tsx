import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';
import {
    CheckCircle2,
    ShieldCheck,
} from 'lucide-react';

export function UserInfo({
    user,
    showEmail = false,
}: {
    user: User;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();

    const isOnline = true;
    const role = 'Administrator';

    return (
        <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="relative shrink-0">
                <Avatar className="h-9 w-9 overflow-hidden rounded-full">
                    <AvatarImage
                        src={user.avatar}
                        alt={user.name}
                    />

                    <AvatarFallback className="rounded-full bg-neutral-200 text-sm font-semibold text-black dark:bg-neutral-700 dark:text-white">
                        {getInitials(user.name)}
                    </AvatarFallback>
                </Avatar>

                {isOnline && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-semibold">
                        {user.name}
                    </span>

                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                </div>

                {showEmail && (
                    <span className="text-muted-foreground block truncate text-xs">
                        {user.email}
                    </span>
                )}

                <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <ShieldCheck className="h-3 w-3" />

                    <span className="truncate">
                        {role}
                    </span>
                </div>
            </div>
        </div>
    );
}