interface Props {
  user: any;
}

export default function UserOverviewTab({
  user,
}: Props) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">
        Personal Information
      </h3>

      <div className="grid gap-4 md:grid-cols-2">
        <Info label="Name" value={user.fullName} />
        <Info label="Email" value={user.email} />
        <Info label="Phone" value={user.phone} />
        <Info label="Provider" value={user.provider} />
        <Info label="Role" value={user.role} />
        <Info
          label="Last Login"
          value={user.lastLogin}
        />
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-sm text-gray-500">
        {label}
      </p>
      <p>{value || "—"}</p>
    </div>
  );
}
