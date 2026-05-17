import { Separator } from "@/components/ui/separator";

interface Props {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, action }: Props) {
    return (
        <div className="mb-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                    {subtitle && (
                        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                    )}
                </div>
                {action && <div>{action}</div>}
            </div>
            <Separator className="mt-4" />
        </div>
    );
}