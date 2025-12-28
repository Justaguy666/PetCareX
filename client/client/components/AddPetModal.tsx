import { useState } from "react";
import { apiPost } from "@/api/api";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddPetModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddPetModal({ open, onClose, onSuccess }: AddPetModalProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        pet_name: "",
        species: "",
        breed: "",
        date_of_birth: "",
        gender: "Đực",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await apiPost('/me/pets', formData);

            toast({
                title: "Thành công!",
                description: "Đã thêm thú cưng mới",
            });

            onSuccess(); // Reload pets list
            onClose();

            // Reset form
            setFormData({
                pet_name: "",
                species: "",
                breed: "",
                date_of_birth: "",
                gender: "Đực",
            });
        } catch (error: any) {
            toast({
                title: "Lỗi",
                description: error?.message || "Không thể thêm thú cưng",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Thêm Thú Cưng Mới</DialogTitle>
                    <DialogDescription>
                        Nhập thông tin thú cưng của bạn
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="pet_name">Tên thú cưng *</Label>
                        <Input
                            id="pet_name"
                            value={formData.pet_name}
                            onChange={(e) => setFormData({ ...formData, pet_name: e.target.value })}
                            placeholder="VD: Max, Miu"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="species">Loài *</Label>
                        <Input
                            id="species"
                            value={formData.species}
                            onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                            placeholder="VD: Chó, Mèo, Chim"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="breed">Giống</Label>
                        <Input
                            id="breed"
                            value={formData.breed}
                            onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                            placeholder="VD: Golden Retriever, Persian"
                        />
                    </div>

                    <div>
                        <Label htmlFor="date_of_birth">Ngày sinh</Label>
                        <Input
                            id="date_of_birth"
                            type="date"
                            value={formData.date_of_birth}
                            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        />
                    </div>

                    <div>
                        <Label htmlFor="gender">Giới tính *</Label>
                        <select
                            id="gender"
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            className="w-full px-3 py-2 border border-input rounded-md"
                            required
                        >
                            <option value="Đực">Đực</option>
                            <option value="Cái">Cái</option>
                        </select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Đang thêm..." : "Thêm thú cưng"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
