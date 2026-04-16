const categories = [
  "Waste Bag",
  "Pet Waste Bags",
  "Pet Leashes",
  "Pet Harnesses",
];

export default function Categories() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-10">
      {categories.map((cat) => (
        <div
          key={cat}
          className="border p-6 text-center rounded shadow hover:shadow-lg"
        >
          {cat}
        </div>
      ))}
    </div>
  );
}