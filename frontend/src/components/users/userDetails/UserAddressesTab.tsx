interface Props {
  addresses: any[];
}

export default function UserAddressesTab({
  addresses,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {addresses.map((address) => (
        <div
          key={address.id}
          className="rounded-xl border bg-white p-5"
        >
          <p>{address.name}</p>

          <p>{address.phone}</p>

          <p>{address.street}</p>

          <p>
            {address.city},
            {address.state}
          </p>

          <p>{address.pincode}</p>
        </div>
      ))}
    </div>
  );
}