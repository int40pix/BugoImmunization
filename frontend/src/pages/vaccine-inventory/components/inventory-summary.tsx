import {
    Card,
    CardContent,
} from '@/components/ui/card';

type InventorySummaryItem = {
    id: number;
    quantity: number;
    expiration_date: string;
};

type InventorySummaryProps = {
    vaccines: InventorySummaryItem[];
};

export default function InventorySummary({
    vaccines,
}: InventorySummaryProps) {
    const totalStock = vaccines.reduce(
        (total, vaccine) =>
            total + vaccine.quantity,
        0
    );

    const lowStock = vaccines.filter(
        (vaccine) =>
            vaccine.quantity <= 20
    ).length;

    const expiringSoon =
        vaccines.filter((vaccine) => {
            const today = new Date();

            const expiry =
                new Date(
                    vaccine.expiration_date
                );

            const thirtyDays =
                new Date();

            thirtyDays.setDate(
                today.getDate() + 30
            );

            return (
                expiry <= thirtyDays &&
                expiry >= today
            );
        }).length;

    return (
        <div className="grid gap-4 md:grid-cols-4">

            <Card>
                <CardContent className="pt-6">

                    <p className="text-sm text-muted-foreground">
                        Total Existing Batches
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                        {vaccines.length}
                    </p>

                </CardContent>
            </Card>


            <Card>
                <CardContent className="pt-6">

                    <p className="text-sm text-muted-foreground">
                        Total Stock
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                        {totalStock}
                    </p>

                </CardContent>
            </Card>


            <Card>
                <CardContent className="pt-6">

                    <p className="text-sm text-muted-foreground">
                        Low Stock
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                        {lowStock}
                    </p>

                </CardContent>
            </Card>


            <Card>
                <CardContent className="pt-6">

                    <p className="text-sm text-muted-foreground">
                        Expiring Soon
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                        {expiringSoon}
                    </p>

                </CardContent>
            </Card>

        </div>
    );
}