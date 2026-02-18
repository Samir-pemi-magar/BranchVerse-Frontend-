"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  getSingleStory,
  GetMainChapters,
  LikeStory,
  GetPersonalizedStories,
} from "@/src/Services/storyApi";
import { getPreferences } from "@/src/Services/authapi";
import { MdDateRange } from "react-icons/md";
import { FaEye } from "react-icons/fa";
import { FcLike } from "react-icons/fc";
import Link from "next/link";
import { useForm } from "react-hook-form";

interface Author {
  _id: string;
  username: string;
}

export interface Story {
  _id: string;
  title: string;
  tags: string[];
  description: string;
  cover: string;
  author: Author;
  views: number;
  likes: number;
  branchAllowed: boolean;
  branchesCount: number;
  createdAt: string; // ISO date string
  __v: number;
}
export interface Chapter {
  length: number;
  _id: string;
  title: string;
  chapterNumber: number;
}

export default function StoryPreview() {
  const [preferences, setPreferences] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const storyId = searchParams?.get("id") ?? "";
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tags, settags] = useState<string[]>([]); // explicitly string array
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [likes, setLikes] = useState(0);
  const [personalizedStories, setPersonalizedStories] = useState<Story[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data); // { email, password }
  };

  const coverSrc =
    story?.cover && process.env.NEXT_PUBLIC_BASEURL
      ? `${process.env.NEXT_PUBLIC_BASEURL}/api/stories/cover/${story.cover}`
      : "/images/placeholder-cover.png";
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const data = await getPreferences(token);
        if (data?.preferences?.genres) {
          setPreferences(data.preferences.genres);
        }
      } catch (err) {
        console.error("Failed to fetch preferences", err);
      }
    };
    fetchPreferences();
  }, []);

  useEffect(() => {
    if (!storyId) {
      setError("No story id provided");
      setStory(null);
      return;
    }

    const fetchSingleStory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSingleStory(storyId);
        setStory(data);
        settags(data.tags);
      } catch (err) {
        console.error("Failed to fetch story", err);
        setError("Failed to load story");
        setStory(null);
      } finally {
        setLoading(false);
      }
    };
    const getMainChapters = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await GetMainChapters(storyId);
        setChapters(data);
      } catch (err) {
        console.error("Failed to fetch Chapters", err);
        setError("Failed to load Chapters");
        setStory(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchPersonalized = async () => {
      try {
        const data = await GetPersonalizedStories();
        setPersonalizedStories(data);
      } catch (err) {
        console.error("Failed to fetch personalized stories", err);
      }
    };

    fetchSingleStory();
    getMainChapters();
    if (preferences.length > 0) {
      fetchPersonalized();
    }
  }, [storyId, preferences]);

  const handleLikeStory = async (id: string) => {
    const res = await LikeStory(id);
    setLikes(res.likes);
  };

  return (
    <div className="py-[90px] w-full h-auto px-40 flex flex-col items-center gap-[47px]">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <section className="flex flex-row w-full items-start justify-start gap-20 px-8">
        <div className="w-[504px]">
          {loading ? (
            <div className="w-full h-[304px] bg-gray-200 animate-pulse rounded" />
          ) : (
            <img
              src={coverSrc}
              alt={story?.title ?? "cover"}
              className="w-full h-[304px] object-cover rounded"
            />
          )}
        </div>

        <div className="flex flex-col items-start gap-[15px] px-2 mt-1">
          <div className="flex flex-col gap-2">
            <span className="font-bold text-[42px]">
              {story?.title || "Untitled"}
            </span>
            <div className="flex flex-row gap-[9px]">
              #Profileimage
              <span className="font-semibold text-[16px]">
                {story?.author?.username || "Unknown"}
              </span>
            </div>
          </div>
          <span className="w-[103px] h-[33px] items-center justify-center font-bold text-white bg-[#9E77DC] rounded-full px-4 py-1">
            Origin
          </span>
          <div className="flex flex-row gap-7">
            <div
              className="flex flex-row gap-1.5 items-center"
              onClick={() => {
                handleLikeStory(storyId);
              }}
            >
              <FcLike /> <span>{story?.likes ?? 0}</span>
            </div>
            <div className="flex flex-row gap-1.5 items-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M5 10.038C5.32593 9.70547 5.71491 9.44134 6.14419 9.26104C6.57347 9.08075 7.0344 8.98791 7.5 8.98798H9.5C10.0871 8.98818 10.6555 8.78178 11.1056 8.40495C11.5557 8.02813 11.8589 7.50491 11.962 6.92698C11.4934 6.79646 11.0885 6.49965 10.8229 6.09209C10.5574 5.68454 10.4495 5.19418 10.5194 4.71281C10.5893 4.23144 10.8323 3.79205 11.2028 3.47689C11.5733 3.16173 12.046 2.9924 12.5324 3.0006C13.0187 3.00881 13.4854 3.19397 13.8451 3.52145C14.2048 3.84892 14.4328 4.29626 14.4864 4.77971C14.5401 5.26317 14.4157 5.74961 14.1366 6.14798C13.8575 6.54635 13.4427 6.82934 12.97 6.94398C12.8591 7.78581 12.446 8.55862 11.8076 9.11846C11.1692 9.6783 10.3491 9.98697 9.5 9.98698H7.5C6.9088 9.98682 6.33666 10.1962 5.88519 10.5779C5.43373 10.9596 5.13215 11.489 5.034 12.072C5.50167 12.2015 5.9063 12.4966 6.17247 12.9024C6.43865 13.3082 6.54822 13.7968 6.48078 14.2774C6.41333 14.758 6.17346 15.1976 5.80586 15.5144C5.43827 15.8312 4.96803 16.0036 4.48278 15.9993C3.99753 15.9951 3.53036 15.8146 3.16834 15.4915C2.80632 15.1683 2.57414 14.7246 2.51506 14.2429C2.45599 13.7612 2.57405 13.2745 2.84725 12.8735C3.12045 12.4724 3.53015 12.1843 4 12.063V3.93698C3.52868 3.81528 3.11791 3.52587 2.8447 3.12298C2.5715 2.72009 2.45461 2.23139 2.51595 1.74848C2.57728 1.26557 2.81264 0.821613 3.17789 0.499819C3.54314 0.178025 4.01322 0.000488281 4.5 0.000488281C4.98679 0.000488281 5.45687 0.178025 5.82212 0.499819C6.18737 0.821613 6.42273 1.26557 6.48406 1.74848C6.5454 2.23139 6.42851 2.72009 6.15531 3.12298C5.8821 3.52587 5.47133 3.81528 5 3.93698V10.038Z"
                  fill="#00B8AE"
                />
              </svg>
              <span>{story?.branchesCount}</span>
            </div>
            <div className="flex flex-row gap-1.5 items-center">
              <FaEye />

              <span>{story?.views}</span>
            </div>
            <div className="flex flex-row gap-1.5 items-center">
              <MdDateRange /> <span>{story?.createdAt}</span>
            </div>
          </div>
          <div className="flex flex-row gap-5">
            {story && chapters && chapters.length > 0 && (
              <Link
                href={`/Users/StoryReader?storyId=${storyId}&chapterId=${chapters[0]._id}`}
                className="h-[43px] w-fit px-2 py-1 bg-[#00B8AE] rounded-[7px] font-semibold text-white flex items-center"
              >
                Start Reading
              </Link>
            )}
            <button className="h-[43px] px-2 py-1 bg-[#00B8AE] w-fit rounded-[7px] font-semibold text-white">
              Branch This Story
            </button>
          </div>
        </div>
      </section>
      <section className="flex flex-col w-full px-8">
        <span className="text-[18px] font-semibold mb-6">Preview</span>
        <p className="text-black font-normal text-[18px] max-w-full wrap-break-word">
          {story?.description}
        </p>
      </section>
      <section className="flex flex-col w-full px-8">
        <span className="text-[18px] font-semibold text-slate-900 mb-6">
          Tags
        </span>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className="bg-[#F6F3FC] hover:bg-[#EBEBF2] text-black text-xs font-semibold px-4 py-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
              aria-pressed="false"
            >
              {tag}
            </button>
          ))}
        </div>
      </section>
      <section className="flex flex-col w-full px-8">
        <h2 className="text-[18px] font-semibold mb-6">Branch Lineage</h2>
        <div className="space-y-4 pl-2">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-teal-100 rounded-md shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M5 10.038C5.32593 9.70547 5.71491 9.44134 6.14419 9.26104C6.57347 9.08075 7.0344 8.98791 7.5 8.98798H9.5C10.0871 8.98818 10.6555 8.78178 11.1056 8.40495C11.5557 8.02813 11.8589 7.50491 11.962 6.92698C11.4934 6.79646 11.0885 6.49965 10.8229 6.09209C10.5574 5.68454 10.4495 5.19418 10.5194 4.71281C10.5893 4.23144 10.8323 3.79205 11.2028 3.47689C11.5733 3.16173 12.046 2.9924 12.5324 3.0006C13.0187 3.00881 13.4854 3.19397 13.8451 3.52145C14.2048 3.84892 14.4328 4.29626 14.4864 4.77971C14.5401 5.26317 14.4157 5.74961 14.1366 6.14798C13.8575 6.54635 13.4427 6.82934 12.97 6.94398C12.8591 7.78581 12.446 8.55862 11.8076 9.11846C11.1692 9.6783 10.3491 9.98697 9.5 9.98698H7.5C6.9088 9.98682 6.33666 10.1962 5.88519 10.5779C5.43373 10.9596 5.13215 11.489 5.034 12.072C5.50167 12.2015 5.9063 12.4966 6.17247 12.9024C6.43865 13.3082 6.54822 13.7968 6.48078 14.2774C6.41333 14.758 6.17346 15.1976 5.80586 15.5144C5.43827 15.8312 4.96803 16.0036 4.48278 15.9993C3.99753 15.9951 3.53036 15.8146 3.16834 15.4915C2.80632 15.1683 2.57414 14.7246 2.51506 14.2429C2.45599 13.7612 2.57405 13.2745 2.84725 12.8735C3.12045 12.4724 3.53015 12.1843 4 12.063V3.93698C3.52868 3.81528 3.11791 3.52587 2.8447 3.12298C2.5715 2.72009 2.45461 2.23139 2.51595 1.74848C2.57728 1.26557 2.81264 0.821613 3.17789 0.499819C3.54314 0.178025 4.01322 0.000488281 4.5 0.000488281C4.98679 0.000488281 5.45687 0.178025 5.82212 0.499819C6.18737 0.821613 6.42273 1.26557 6.48406 1.74848C6.5454 2.23139 6.42851 2.72009 6.15531 3.12298C5.8821 3.52587 5.47133 3.81528 5 3.93698V10.038Z"
                  fill="#00B8AE"
                />
              </svg>
            </div>
            <div className="text-sm">
              <span className="text-slate-500">Branched from:&nbsp;</span>
              <a
                href="#"
                className="text-teal-500 font-semibold hover:underline"
              >
                The Last Sentinel
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-md shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M5 10.038C5.32593 9.70547 5.71491 9.44134 6.14419 9.26104C6.57347 9.08075 7.0344 8.98791 7.5 8.98798H9.5C10.0871 8.98818 10.6555 8.78178 11.1056 8.40495C11.5557 8.02813 11.8589 7.50491 11.962 6.92698C11.4934 6.79646 11.0885 6.49965 10.8229 6.09209C10.5574 5.68454 10.4495 5.19418 10.5194 4.71281C10.5893 4.23144 10.8323 3.79205 11.2028 3.47689C11.5733 3.16173 12.046 2.9924 12.5324 3.0006C13.0187 3.00881 13.4854 3.19397 13.8451 3.52145C14.2048 3.84892 14.4328 4.29626 14.4864 4.77971C14.5401 5.26317 14.4157 5.74961 14.1366 6.14798C13.8575 6.54635 13.4427 6.82934 12.97 6.94398C12.8591 7.78581 12.446 8.55862 11.8076 9.11846C11.1692 9.6783 10.3491 9.98697 9.5 9.98698H7.5C6.9088 9.98682 6.33666 10.1962 5.88519 10.5779C5.43373 10.9596 5.13215 11.489 5.034 12.072C5.50167 12.2015 5.9063 12.4966 6.17247 12.9024C6.43865 13.3082 6.54822 13.7968 6.48078 14.2774C6.41333 14.758 6.17346 15.1976 5.80586 15.5144C5.43827 15.8312 4.96803 16.0036 4.48278 15.9993C3.99753 15.9951 3.53036 15.8146 3.16834 15.4915C2.80632 15.1683 2.57414 14.7246 2.51506 14.2429C2.45599 13.7612 2.57405 13.2745 2.84725 12.8735C3.12045 12.4724 3.53015 12.1843 4 12.063V3.93698C3.52868 3.81528 3.11791 3.52587 2.8447 3.12298C2.5715 2.72009 2.45461 2.23139 2.51595 1.74848C2.57728 1.26557 2.81264 0.821613 3.17789 0.499819C3.54314 0.178025 4.01322 0.000488281 4.5 0.000488281C4.98679 0.000488281 5.45687 0.178025 5.82212 0.499819C6.18737 0.821613 6.42273 1.26557 6.48406 1.74848C6.5454 2.23139 6.42851 2.72009 6.15531 3.12298C5.8821 3.52587 5.47133 3.81528 5 3.93698V10.038Z"
                  fill="#00B8AE"
                />
              </svg>
            </div>
            <div className="text-sm">
              <span className="text-slate-500">Branches:&nbsp;</span>
              <a
                href="#"
                className="text-purple-500 font-semibold hover:underline"
              >
                {story?.branchesCount}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-600 text-xs text-slate-400">
          Explore the different paths this story can take, or create your own
          branch!
        </div>
      </section>

      <section className="flex flex-col w-full px-8 items-center gap-10 bg-gray-50 py-10">
        <span className="tex-[18px] font-semibold">More From BranchVerse</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {personalizedStories.map((story) => (
            <Link
              key={story._id}
              href={`/Users/StoryPreview?id=${story._id}`}
              className="bg-white border rounded-xl shadow-md hover:shadow-lg p-3 transition flex flex-col"
            >
              <img
                src={`${process.env.NEXT_PUBLIC_BASEURL}/api/stories/cover/${story.cover}`}
                className="w-full h-[220px] rounded-lg object-cover"
              />

              <div className="mt-3 flex-1 flex flex-col">
                <p className="text-[20px] font-bold">{story.title}</p>
                <p className="text-sm text-gray-600 mt-1">
                  By {story.author.username}
                </p>

                <div className="mt-3 flex items-center gap-2 text-[#00B8AE] font-semibold">
                  <p>{story.branchesCount} Branches</p>
                  <p className="text-sm text-gray-500">• {story.views} views</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
