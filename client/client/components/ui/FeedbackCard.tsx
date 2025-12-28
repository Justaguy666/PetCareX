import * as React from "react";
import { Card } from "./card";
import { RatingInput } from "./RatingInput";
import { Textarea } from "./textarea";
import { Label } from "./label";
import { cn } from "@/lib/utils";

export interface FeedbackValues {
    serviceQuality: number;
    staffAttitude: number;
    overallSatisfaction: number;
    comment?: string;
}

export interface FeedbackCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    values?: FeedbackValues;
    onChange?: (v: FeedbackValues) => void;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
    values,
    onChange,
    className,
    ...props
}) => {
    const [state, setState] = React.useState<FeedbackValues>(
        values || { serviceQuality: 0, staffAttitude: 0, overallSatisfaction: 0, comment: '' },
    );

    React.useEffect(() => setState(values || state), [values]);

    const update = (patch: Partial<FeedbackValues>) => {
        const next = { ...state, ...patch };
        setState(next);
        onChange?.(next);
    };

    return (
        <Card className={cn('p-6 border border-border bg-transparent', className)} {...props}>
            <div className="mb-4">
                <h3 className="text-xl font-bold text-foreground">Service Feedback</h3>
                <p className="text-sm text-muted-foreground">Help us improve by sharing your experience</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div>
                    <Label>Điểm chất lượng dịch vụ</Label>
                    <RatingInput
                        name="serviceQuality"
                        value={state.serviceQuality}
                        onChange={(v) => update({ serviceQuality: v })}
                    />
                </div>

                <div>
                    <Label>Thái độ nhân viên</Label>
                    <RatingInput
                        name="staffAttitude"
                        value={state.staffAttitude}
                        onChange={(v) => update({ staffAttitude: v })}
                    />
                </div>

                <div>
                    <Label>Mức độ hài lòng tổng thể</Label>
                    <RatingInput
                        name="overallSatisfaction"
                        value={state.overallSatisfaction}
                        onChange={(v) => update({ overallSatisfaction: v })}
                    />
                </div>
            </div>

            <div>
                <Label>Bình luận</Label>
                <Textarea
                    value={state.comment}
                    onChange={(e) => update({ comment: e.target.value })}
                    placeholder="Share your thoughts or suggestions (optional)"
                />
            </div>
        </Card>
    );
};

export default FeedbackCard;
