import Link from "next/link";
import Image from "next/image";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { fetchUser, getNotifications } from "@/lib/actions/user.actions";

async function Page() {
  const user = await currentUser();

  if (!user) return null;

  const userInfo = await fetchUser(user.id);

  if (!userInfo?.onboarded) redirect("/onboarding");

  // get notifications
  const notifications = await getNotifications(userInfo._id);

  return (
    <section>
      <h1 className="head-text mb-10">Notifications</h1>

      <div className="mt-10 flex flex-col gap-5">
        {notifications?.length === 0 ? (
          <p className="no-result">No notifications found</p>
        ) : (
          <>
            {notifications?.map((notification) => (
              <Link
                key={notification._id}
                href={`/thread/${notification.parentId}`}
              >
                <article className="activity-card">
                  <Image
                    src={notification.author.image}
                    alt="Profile picture"
                    width={20}
                    height={20}
                    className="rounded-full object-cover"
                  />
                  <p className="!text-small-regular text-light-1">
                    <span className="mr-1 text-primary-500">
                      {notification.author.name}
                    </span>{" "}
                    replied to your thread
                  </p>
                </article>
              </Link>
            ))}
          </>
        )}
      </div>
    </section>
  );
}

export default Page;
