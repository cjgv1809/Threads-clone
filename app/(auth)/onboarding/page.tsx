import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";
import AccountProfile from "@/components/forms/AccountProfile";
import { fetchUser } from "@/lib/actions/user.actions";

type Props = {
  id: string | undefined;
  objectId: string;
  username: string | null | undefined;
  name: string;
  bio: string;
  image: string | undefined;
};

type UserInfoProps = {
  _id: string;
  username: string;
  name: string;
  bio: string;
  image: string;
};

async function Page() {
  const user = await currentUser();
  const userInfo = {} as UserInfoProps;
  const userData: Props = {
    id: user?.id,
    objectId: userInfo?._id,
    username: userInfo?.username || user?.username,
    name: userInfo?.name || user?.firstName || "",
    bio: userInfo?.bio || "",
    image: userInfo?.image || user?.imageUrl,
  };

  if (!user) return null;

  const userInfoFromDB = await fetchUser(user.id);

  !userInfoFromDB?.onboarded ? redirect("/onboarding") : redirect("/");

  return (
    <main className="mx-auto flex max-w-3xl flex-col justify-start px-10 py-20">
      <h1 className="head-text">Onboarding</h1>
      <p className="mt-3 text-base-regular text-light-2">
        Complete your profile now to use Threads
      </p>

      <section className="mt-9 bg-dark-2 p-10">
        <AccountProfile userData={userData} btnTitle="Continue" />
      </section>
    </main>
  );
}

export default Page;
