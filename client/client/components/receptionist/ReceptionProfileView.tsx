import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Props { profile: any }

export default function ReceptionProfileView({ profile }: Props) {
    const navigate = useNavigate();

    return (
        <Card className="p-6 border border-border max-w-3xl">
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Employee ID</p>
                        <p className="font-medium text-foreground">{profile.staffId}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Full Name</p>
                        <p className="font-medium text-foreground">{profile.fullName}</p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">Date of Birth</p>
                        <p className="font-medium text-foreground">{profile.dob}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Gender</p>
                        <p className="font-medium text-foreground capitalize">{profile.gender}</p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">Start Date</p>
                        <p className="font-medium text-foreground">{profile.startDate}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Position</p>
                        <p className="font-medium text-foreground">{profile.position}</p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">Branch</p>
                        <p className="font-medium text-foreground">{profile.branch}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Base Salary</p>
                        <p className="font-medium text-foreground">{profile.baseSalary}</p>
                    </div>
                </div>

                <div className="pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold mb-2">Transfer History</h4>
                    {Array.isArray(profile.transferHistory) && profile.transferHistory.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm table-auto">
                                <thead>
                                    <tr className="text-left text-xs text-muted-foreground">
                                        <th className="pr-4">From</th>
                                        <th className="pr-4">To</th>
                                        <th className="pr-4">Date</th>
                                        <th>Reason</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {profile.transferHistory.map((h: any, idx: number) => (
                                        <tr key={idx} className="border-t border-border">
                                            <td className="py-2 pr-4 truncate max-w-[160px]">{h.from}</td>
                                            <td className="py-2 pr-4 truncate max-w-[160px]">{h.to}</td>
                                            <td className="py-2 pr-4 text-muted-foreground">{h.date}</td>
                                            <td className="py-2 truncate">{h.reason || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No transfer history</p>
                    )}
                </div>

                <div className="flex gap-2 pt-4">
                    <Button onClick={() => navigate('/receptionist/profile/edit')} className="bg-primary text-white">Edit Profile</Button>
                </div>
            </div>
        </Card>
    );
}
