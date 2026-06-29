import { useState } from "react";
import Input from "../../input/InputField";
import Button from "../../ui/button/Button";
import Label from "../../form/Label";
import ComponentCard from "../../common/ComponentCard";
import {
  useCmsStore,
  type JoinCommunityStatus,
} from "../../../store/cmsStore";

const STATUSES: JoinCommunityStatus[] = [
  "ADDED",
  "PENDING",
  "INVALID",
  "VALID",
];

type Props = { onClose: () => void };

export default function AddJoinCommunityForm({ onClose }: Props) {
  const { addJoinCommunity, error } = useCmsStore();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<JoinCommunityStatus>("ADDED");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrors({ email: "Email is required" });
      return;
    }
    try {
      await addJoinCommunity(email.trim(), status);
      onClose();
    } catch {
      /* store */
    }
  };

  return (
    <ComponentCard title="Add Email" desc="">
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        {error && <p className="text-sm text-error-500">{error}</p>}
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!errors.email}
            hint={errors.email || ""}
          />
        </div>
        <div>
          <Label>Status</Label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as JoinCommunityStatus)}
            className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" size="sm" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Add Email
          </Button>
        </div>
      </form>
    </ComponentCard>
  );
}
