// import { ProductReview } from "../../store/productStore";

import type { ProductReview } from "../../components/users/userDetails/types";

type Props = {
  reviews: ProductReview[];
};

export default function ProductReviews({ reviews }: Props) {
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, item) => sum + item.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0";

  const fiveStarReviews = reviews.filter(
    (item) => item.rating === 5
  ).length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-5 dark:border-gray-700">
          <p className="text-sm text-gray-500">
            Average Rating
          </p>
          <h2 className="mt-2 text-3xl font-bold">
            {averageRating}
          </h2>
        </div>

        <div className="rounded-xl border p-5 dark:border-gray-700">
          <p className="text-sm text-gray-500">
            Total Reviews
          </p>
          <h2 className="mt-2 text-3xl font-bold">
            {reviews.length}
          </h2>
        </div>

        <div className="rounded-xl border p-5 dark:border-gray-700">
          <p className="text-sm text-gray-500">
            5-Star Reviews
          </p>
          <h2 className="mt-2 text-3xl font-bold">
            {fiveStarReviews}
          </h2>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-xl border p-10 text-center dark:border-gray-700">
          <p className="text-gray-500">
            No reviews available for this product.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border p-5 dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <img
                    src={
                      review.user.profileImage ||
                      "https://ui-avatars.com/api/?name=" +
                        encodeURIComponent(
                          review.user.fullName
                        )
                    }
                    alt={review.user.fullName}
                    className="h-12 w-12 rounded-full object-cover"
                  />

                  <div>
                    <h3 className="font-semibold">
                      {review.user.fullName}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {review.user.email}
                    </p>

                    {review.user.createdAt && (
                      <p className="mt-1 text-xs text-gray-400">
                        Customer since{" "}
                        {new Date(
                          review.user.createdAt
                        ).toLocaleDateString()}
                      </p>
                    )}

                    {review.user._count?.orders !==
                      undefined && (
                      <p className="text-xs text-gray-400">
                        Orders:{" "}
                        {review.user._count.orders}
                      </p>
                    )}

                    <div className="mt-2 flex">
                      {Array.from({ length: 5 }).map(
                        (_, index) => (
                          <span
                            key={index}
                            className={`text-lg ${
                              index < review.rating
                                ? "text-yellow-500"
                                : "text-gray-300"
                            }`}
                          >
                            ★
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <span className="text-xs text-gray-500">
                  {new Date(
                    review.createdAt
                  ).toLocaleDateString()}
                </span>
              </div>

              <div className="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <p className="text-sm leading-relaxed">
                  {review.review ||
                    "No written review provided."}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}