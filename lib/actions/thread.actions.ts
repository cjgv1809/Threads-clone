"use server";

import { revalidatePath } from "next/cache";
import { connectToDB } from "../mongoose";
import Thread from "../models/thread.model";
import User from "../models/user.model";

type Params = {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
};

type CommentParams = {
  threadId: string;
  commentText: string;
  userId: string;
  path: string;
};

export async function createThread({
  text,
  author,
  communityId,
  path,
}: Params) {
  try {
    connectToDB();

    const createdThread = await Thread.create({
      text,
      author,
      community: null,
    });

    // Update user model
    await User.findByIdAndUpdate(author, {
      $push: {
        threads: createdThread._id,
      },
    });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error("Error creating thread", error.message);
  }
}

export async function fetchThreads(pageNumber = 1, pageSize = 20) {
  try {
    connectToDB();

    // fetch threads that have no parents (top=level threads)
    const threadsQuery = Thread.find({
      parentId: { $in: [null, undefined] },
    })
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .populate({ path: "author", model: "User" })
      .populate({
        path: "children",
        populate: {
          path: "author",
          model: "User",
          select: "_id name parentId image",
        },
      });

    const totalThreadsCount = await Thread.countDocuments({
      parentId: { $in: [null, undefined] },
    });

    const threads = await threadsQuery.exec();

    const isNext =
      totalThreadsCount > (pageNumber - 1) * pageSize + threads.length;

    return {
      threads,
      isNext,
    };
  } catch (error: any) {
    throw new Error("Error fetching threads", error.message);
  }
}

export async function fetchThreadById(id: string) {
  try {
    connectToDB();

    const thread = await Thread.findById(id)
      .populate({ path: "author", model: "User", select: "_id id name image" })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: "User",
            select: "_id id name parentId image",
          },
          {
            path: "children",
            model: "Thread",
            populate: {
              path: "author",
              model: "User",
              select: "_id id name parentId image",
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (error: any) {
    throw new Error("Error fetching thread", error.message);
  }
}

export async function addCommentToThread({
  threadId,
  commentText,
  userId,
  path,
}: CommentParams) {
  try {
    connectToDB();

    // find the original thread
    const originalThread = await Thread.findById(threadId);

    if (!originalThread) {
      throw new Error("Thread not found");
    }

    // create a new thread for the comment and add it to the original thread's children
    const commentThread = await Thread.create({
      text: commentText,
      author: userId,
      parentId: threadId,
    });

    // save the comment thread in db
    const savedCommentThread = await commentThread.save();

    // update the original thread's children array
    originalThread.children.push(savedCommentThread._id);

    // save the original thread in db
    await originalThread.save();

    revalidatePath(path);
  } catch (error: any) {
    throw new Error("Error adding comment to thread", error.message);
  }
}
