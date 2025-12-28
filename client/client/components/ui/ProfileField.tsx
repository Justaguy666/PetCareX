import * as React from "react";
import { Label } from "./label";
import { Input } from "./input";
import { cn } from "@/lib/utils";

export interface ProfileFieldProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    label: string;
    name?: string;
    value?: string | number;
    type?: React.ComponentProps<typeof Input>['type'];
    placeholder?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    children?: React.ReactNode; // for select or custom control
}

export const ProfileField: React.FC<ProfileFieldProps> = ({
    label,
    name,
    value,
    type = 'text',
    placeholder,
    onChange,
    children,
    className,
    ...props
}) => {
    return (
        <div className={cn('space-y-2', className)} {...props}>
            <Label className="block">{label}</Label>
            {children ? (
                children
            ) : (
                <Input
                    name={name}
                    value={value as any}
                    onChange={onChange as any}
                    placeholder={placeholder}
                    type={type}
                />
            )}
        </div>
    );
};

ProfileField.displayName = 'ProfileField';

export default ProfileField;
