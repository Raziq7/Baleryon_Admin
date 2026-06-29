type CardProps = {
  title: string;
  value: string | number;
};

export function Card({ title, value }: CardProps) {
  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-white/5">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-xl font-bold">{value}</h2>
    </div>
  );
}