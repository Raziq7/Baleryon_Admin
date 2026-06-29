import type{ UserDetails } from "./types";

interface Props {
  user: UserDetails;
}

export default function UserProfileCard({ user }: Props) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="flex items-center gap-4">
        <img
          src={user.image || "/default-avatar.png"}
          alt={user.fullName}
          className="h-20 w-20 rounded-full object-cover"
        />

        <div>
          <h2 className="text-xl font-semibold">
            {user.fullName}
          </h2>

          <p>{user.email}</p>

          <p>{user.phone}</p>

          <div className="mt-2 flex gap-2">
            <span
              className={`rounded px-2 py-1 text-xs ${
                user.isBlocked
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {user.isBlocked ? "Blocked" : "Active"}
            </span>

            <span
              className={`rounded px-2 py-1 text-xs ${
                user.isVerified
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {user.isVerified
                ? "Verified"
                : "Unverified"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}