import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Props {
    count: number;
    label: string;
    to?: string;
}

export default function VetSummaryCard({ count, label, to }: Props) {
    return (
        <Card className="p-6 border border-border flex items-center justify-between">
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold mt-2">{count}</p>
            </div>

            {to ? (
                <Link to={to}>
                    <Button size="sm" variant="outline">Open</Button>
                </Link>
            ) : (
                <Button size="sm" variant="outline">Open</Button>
            )}
        </Card>
    );
}
