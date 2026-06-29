interface Props {
  tracking: any[];
}

export default function UserTrackingTab({
  tracking,
}: Props) {
  return (
    <div className="space-y-4">
      {tracking.map((item) => (
        <div
          key={item.id}
          className="rounded-xl border bg-white p-5"
        >
          <h4>{item.orderNumber}</h4>

          <p>
            Courier: {item.courierName}
          </p>

          <p>
            Tracking:
            {item.trackingNumber}
          </p>

          <p>Status: {item.status}</p>
        </div>
      ))}
    </div>
  );
}