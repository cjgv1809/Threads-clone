"use server";

import { revalidatePath } from "next/cache";
import { FilterQuery, SortOrder } from "mongoose";
import User from "../models/user.model";
import Thread from "../models/thread.model";
import { connectToDB } from "../mongoose";

type Params = {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
};

type UsersParams = {
  userId: string;
  searchTerm?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
};

export async function updateUser({
  userId,
  username,
  name,
  bio,
  image,
  path,
}: Params): Promise<void> {
  connectToDB();

  try {
    await User.findOneAndUpdate(
      {
        id: userId,
      },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      {
        upsert: true,
      }
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

export async function fetchUser(userId: string) {
  try {
    connectToDB();

    return await User.findOne({
      id: userId,
    });
    // .populate({
    //   path: "communities",
    //   model: "Community",
    // });
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

export async function fetchUserThreads(userId: string) {
  try {
    connectToDB();

    // find all threads authored by the user with the given userId
    const threads = await User.findOne({ id: userId }).populate({
      path: "threads",
      model: "Thread",
      populate: {
        path: "children",
        model: "Thread",
        populate: {
          path: "author",
          model: "User",
          select: "id name image",
        },
      },
    });

    return threads;
  } catch (error: any) {
    throw new Error(`Failed to fetch user threads: ${error.message}`);
  }
}

export async function fetchUsers({
  userId,
  searchTerm = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: UsersParams) {
  try {
    connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;

    const regex = new RegExp(searchTerm, "i");

    const query: FilterQuery<typeof User> = {
      id: { $ne: userId },
    };

    if (searchTerm.trim() !== "") {
      query["$or"] = [{ username: regex }, { name: regex }];
    }

    const sortOptions = {
      createdAt: sortBy,
    };

    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    const totalUsersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();

    const isNext = totalUsersCount > skipAmount + users.length;

    return {
      users,
      isNext,
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
}

export async function getNotifications(userId: string) {
  try {
    connectToDB();

    // find all threads authored by the user with the given userId
    const userThreads = await Thread.find({ author: userId });

    // collect all the child thread ids (replies) from the children field
    const childThreadIds = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children);
    }, []);

    const replies = await Thread.find({
      _id: { $in: childThreadIds },
      author: { $ne: userId },
    }).populate({
      path: "author",
      model: "User",
      select: "_id name image",
    });

    return replies;
  } catch (error: any) {
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  }
}
