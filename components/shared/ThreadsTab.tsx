import { redirect } from "next/navigation";
import { fetchUserThreads } from "@/lib/actions/user.actions";
import ThreadCard from "../cards/ThreadCard";

type Props = {
  currentUserId: string;
  accountId: string;
  accountType: string;
};

async function ThreadsTab({ currentUserId, accountId, accountType }: Props) {
  const result = await fetchUserThreads(accountId);

  if (!result) redirect("/");

  return (
    <section className="mt-9 flex flex-col gap-10">
      {result?.threads.length === 0 ? (
        <p className="no-result">No threads found</p>
      ) : (
        <>
          {result?.threads.map((thread: any) => (
            <ThreadCard
              key={thread._id}
              id={thread._id}
              currentUserId={currentUserId}
              parentId={thread.parentId}
              content={thread.text}
              author={
                accountType === "User"
                  ? {
                      name: result.name,
                      image: result.image,
                      id: result.id,
                    }
                  : {
                      name: thread.author.name,
                      image: thread.author.image,
                      id: thread.author.id,
                    }
              }
              community={thread.community}
              createdAt={thread.createdAt}
              comments={thread.children}
            />
          ))}
        </>
      )}
    </section>
  );
}

export default ThreadsTab;
