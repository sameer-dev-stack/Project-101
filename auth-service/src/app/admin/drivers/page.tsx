import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

const drivers = [
  {
    name: "Alice Johnson",
    email: "alice@example.com",
    status: "Approved",
    totalRides: 120,
    totalEarnings: 3200.5,
  },
  {
    name: "Bob Williams",
    email: "bob@example.com",
    status: "Pending",
    totalRides: 0,
    totalEarnings: 0.0,
  },
  {
    name: "Charlie Brown",
    email: "charlie@example.com",
    status: "Approved",
    totalRides: 75,
    totalEarnings: 1850.75,
  },
  {
    name: "Diana Miller",
    email: "diana@example.com",
    status: "Rejected",
    totalRides: 0,
    totalEarnings: 0.0,
  },
  {
    name: "Ethan Davis",
    email: "ethan@example.com",
    status: "Approved",
    totalRides: 210,
    totalEarnings: 5500.0,
  },
  {
    name: "Fiona Garcia",
    email: "fiona@example.com",
    status: "Pending",
    totalRides: 0,
    totalEarnings: 0.0,
  },
];

export default function DriversPage() {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <Badge variant="default">Approved</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Drivers</CardTitle>
        <CardDescription>
          Onboard, view, and manage all drivers in the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Driver</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="text-right">Total Rides</TableHead>
              <TableHead className="hidden md:table-cell text-right">Total Earnings</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.map((driver) => (
              <TableRow key={driver.email}>
                <TableCell>
                  <div className="font-medium">{driver.name}</div>
                  <div className="text-sm text-muted-foreground hidden md:inline">
                    {driver.email}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{getStatusBadge(driver.status)}</TableCell>
                <TableCell className="text-right">
                  {driver.totalRides}
                </TableCell>
                <TableCell className="hidden md:table-cell text-right">
                  ${driver.totalEarnings.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {driver.status === "Pending" && (
                        <>
                          <DropdownMenuItem>Approve</DropdownMenuItem>
                          <DropdownMenuItem>Reject</DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Suspend
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
