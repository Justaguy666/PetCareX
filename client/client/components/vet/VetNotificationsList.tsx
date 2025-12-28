import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export type VetNotification = { id: string; type: string; text: string; time?: string; read?: boolean };

interface Props {
    notifications: VetNotification[];
    onToggle?: (id: string) => void;
}

export default function VetNotificationsList({ notifications, onToggle }: Props) {
    const [local, setLocal] = useState(notifications);

    const toggle = (id: string) => {
        setLocal((prev) => prev.map((n) => n.id === id ? { ...n, read: !n.read } : n));
        onToggle?.(id);
    };

    return (
        <Card className="p-4 border border-border">
            <ul className="space-y-3">
                {local.map((n) => (
                    <li key={n.id} className={`p-3 rounded-md border ${n.read ? 'bg-slate-50' : 'bg-white'}`}>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="font-medium">{n.type}</p>
                                <p className="text-sm text-muted-foreground">{n.text}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-muted-foreground mb-2">{n.time ? new Date(n.time).toLocaleString() : 'just now'}</div>
                                <Button size="sm" variant="outline" onClick={() => toggle(n.id)}>{n.read ? 'Mark unread' : 'Mark read'}</Button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </Card>
    );
}
